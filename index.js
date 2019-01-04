/*
 * Copyright 2018 Paul Reeve <paul@pdjr.eu>
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0

 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

const execSync = require('child_process').execSync;
const exec = require('child_process').exec;
const fs = require('fs');
const bacon = require('baconjs');
const Log = require("./lib/log.js");
const Schema = require("./lib/schema.js");
const nmea2000 = require("./lib/nmea2000.js");

const PLUGIN_SCHEMA_FILE = __dirname + "/schema.json";
const PLUGIN_UISCHEMA_FILE = __dirname + "/uischema.json";
const PLUGIN_SCRIPT_DIRECTORY = __dirname + "/script";
const DEBUG = false;

module.exports = function(app) {
	var plugin = {};
	var unsubscribes = [];

	plugin.id = "switchbank";
	plugin.name = "Switchbank";
	plugin.description = "Operate N2K switchbank relays from N2K switchbank switches";

    const log = new Log(app.setProviderStatus, app.setProviderError, plugin.id);

	plugin.schema = function() {
        var schema = Schema.createSchema(PLUGIN_SCHEMA_FILE);
        return(schema.getSchema());
    };

	plugin.uiSchema = function() {
        var schema = Schema.createSchema(PLUGIN_UISCHEMA_FILE);
        return(schema.getSchema());
    }

	plugin.start = function(options) {

        var switchbanks = options.switchbanks.reduce((a,s) => { a[s['instance']] = (new Array(s['channels'])).fill(0); return(a); }, {});
        log.N("connected to " + Object.keys(switchbanks).length + " switch bank(s)");
        fs.writeFileSync(__dirname + "/public/manifest.json", JSON.stringify(options));
        

        unsubscribes = (options.rules || []).map(({ switchpath, relaypath, comment }) => {
            var switchstream = app.streambundle.getSelfStream(switchpath).skipDuplicates();
            var switchinstance = getInstance(switchpath);
            var switchchannel = getChannel(switchpath) - 1;
            var relaystream = app.streambundle.getSelfStream(relaypath).skipDuplicates();
            var relayinstance = getInstance(relaypath);
            var relaychannel = getChannel(relaypath) - 1;
            return(
                bacon.combineWith(
                    (sv,rv) => [ sv, rv, ((sv == rv)?0:((sv > rv)?1:-1)) ],
                    switchstream,
                    relaystream
                ).onValue(([sv, rv, action]) => {
                    //console.log(">>>> Updating switchbank " + relayinstance + ", channel " + relaychannel);
                    switchbanks[switchinstance][switchchannel] = sv;
                    switchbanks[relayinstance][relaychannel] = rv;
                    fs.writeFileSync(__dirname + "/public/state.json", JSON.stringify(switchbanks));
                    
                    if (action != 0) {
                        var buffer = Array.from(switchbanks[relayinstance]);
                        buffer[relaychannel] = sv;
                        var message = nmea2000.makeMessagePGN127502(relayinstance, buffer);
                        //console.log(">>>> Sending NMEA message " + message);
                        app.emit('nmea2000out', message)
                    }
                })
            );
        });
    }

    function getInstance(path) { return(path.split('.')[2]); }
    function getChannel(path) { return(path.split('.')[3]); }

	plugin.stop = function() {
		unsubscribes.forEach(f => f());
		unsubscribes = [];
	}

	return plugin;
}
