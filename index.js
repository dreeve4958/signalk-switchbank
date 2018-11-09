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

module.exports = function(app) {
	var plugin = {};
	var unsubscribes = [];

	plugin.id = "switchbank";
	plugin.name = "Switchbank";
	plugin.description = "Operate N2K switchbank relays from N2K switchbank switches";

	plugin.schema = function() {
		return({	
			type: "object",
			properties: {
				title: "Map",
				type: "array",
				default: [],
				items: {
					type: "object",
					properties: {
						switchpath: {
							title: "Switch path",
							type: "string",
							default: ""
						},
						relaypath: {
							title: "Relay path",
							type: "string",
							default: ""
						},
						mapping: {
							title: "Mapping function",
							type: "array",
							items: {
								type: "string",
								enum: ["clone","invert"]
							},
							uniqueItems: true
						}
					}
				}
			}
		});
	}
 
	plugin.uiSchema = {
	}

	plugin.start = function(options) {
	}

	plugin.stop = function() {
		unsubscribes.forEach(f => f());
		unsubscribes = [];
	}

	function loadMap() {
		return([]);
	}

	function log(prefix, terse, verbose) {
		if (verbose) console.log(plugin.id + ": " + prefix + ": " + verbose);
		if (terse) {
			if (prefix !== "error") { app.setProviderStatus(terse); } else { app.setProviderError(terse); }
		}
	}

	function logE(terse, verbose) { log("error", terse, (verbose === undefined)?terse:verbose); }
	function logW(terse, verbose) { log("warning", terse, (verbose === undefined)?terse:verbose); }
	function logN(terse, verbose) { log("notice", terse, (verbose === undefined)?terse:verbose); }


	return plugin;
}


