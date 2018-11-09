# signalk-switchbank

Operate N2K switchbank relays from Signal K switch inputs.

__signalk-switchbank__ is very simple plugin written to replace a switchbank
controller which I originally wrote in C (and then Python) to support remote
switching on my NMEA 2000 based ship.
My original software decoded PGN 127501 (Switchbank Status) messages and
issued PGN 127502 (Switchbank Control) messages based upon a simple set of
mapping rules: Signal K Node server now takes care of decoding PGN 127501
messages and generalises them into the Signal K, so now pretty much any
switch input can be used to drive PGN 127502 output.

The mapping rules between a switch input and a relay output are expressed
in a simple but rather long-winded way and the
Bootstrap
style configuration screens in Signal K are not friendly.
Instead, the user of this script is encouraged to supply an external JSON
file expressing the mapping rules which can be read when the plugin
initialises.




