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

const MAPCONFIG = __dirname + "/switchbank.json";

module.exports = function(app) {
	var plugin = {};
	var unsubscribes = [];

	plugin.id = "switchbank";
	plugin.name = "Switchbank";
	plugin.description = "Operate N2K switchbank relays from N2K switchbank switches";

	plugin.schema = {
		type: "object",
		properties: {
				rules: {
				title: "Rules",
				type: "array",
				"default": loadMap(),
				items: {
					title: "Rule",
					type: "object",
					properties: {
						"switch": {
							title: "Switch",
							type: "object",
							properties: {
								switchbank: {
									title: "switchbank",
									type: "number",
									"default": "0"
								},
								channel: {
									title: "channel",
									type: "number",
									"default": "0"
								}
							}
						},
						relays: {
							title: "Relays",
							type: "array",
							"default": [],
							items: {
								title: "Relay",
								type: "object",
								properties: {
									switchbank: {
										title: "switchbank",
										type: "number",
										"default": "0"
									},
									channel: {
										title: "channel",
										type: "number",
										"default": "0"
									}
								}
							}
						},
						comment: {
							title: "Comment",
							type: "string",
							"default": ""
						}
					}
				}
			}
		}
	}

	plugin.uiSchema = {
	}

	plugin.start = function(options) {
		if (options.rules.length == 0) {
			logE("no rules to process");
			return;
		} else {
			logN("Processing " + options.rules.length + " rules");
			try {
				var stream = app.streambundle.getSelfStream("electrical.switches.*");
				logN("Got " + (stream !== undefined) + " streams");
				if (stream !== undefined) {
					unsubscribes.push(stream.onValue(function(v) {
						logN(JSON.stringify(v));
					}));
				}
			} catch(err) {
			}
		}
	}

	plugin.stop = function() {
		unsubscribes.forEach(f => f());
		unsubscribes = [];
	}

	function loadMap() {
		try {
			var content = fs.readFileSync(MAPCONFIG).toString();
			try {
				return(JSON.parse(content));
			} catch(err) {
				logE("error parsing configuration file");
			}
		} catch(err) {
			logE("cannot access configuration file");
		}
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
