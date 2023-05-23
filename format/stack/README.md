# Metaviz history stack format

Mimetype: text/mvstack+xml

    <mv>
        <format>MetavizStack</format>
        <version>3</version>
	    <id>...</id>
        <name>...</name>
	    <history>
	        <session id="...">
		        <add timestamp='' nodes='...json' links='...json'/>
		        <del timestamp='' nodes='...json' links='...json'/>
		        <move timestamp='' nodes='id,...' offsetX='' offsetY='' positionX='' positionY=''/>
		        <resize timestamp='' nodes='id,...' w='' h=''/>
		        <param timestamp='' node='' data='...json'/>
	        </session>
	        <session id="...">
	            ...
	        </session>
	    </history>
	</mv>

## Changelog:

### 3:
Added sessions sections for auto-merge.

### 2:
Changed to XML, since last comma in JSON is not merge-friendly.

### 1:
First version of format.