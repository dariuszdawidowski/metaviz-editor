# Metaviz history stack format

Mimetype: text/mvstack+xml

    <mv>
        <format>MetavizStack</format>
        <version>4</version>
	    <id></id>
        <name></name>
	    <history>
	        <session id="">
		        <add timestamp="" node="id" type="" x="" y="" w="" h="" data-*=""/>
		        <add timestamp="" link="id" type="" start="" end=""/>
		        <del timestamp="" nodes="id,..."/>
		        <del timestamp="" links="id,..."/>
		        <move timestamp="" nodes="id,..." offset-x="" offset-y="" position-x="" position-y=""/>
		        <resize timestamp="" nodes="id,..." w="" h=""/>
		        <param timestamp="" node="" data-*=""/>
	        </session>
	        <session id="">
	            ...
	        </session>
	    </history>
	</mv>

## Changelog:

### 4:
Strip json to separate xml attributes.

### 3:
Added sessions sections for auto-merge.

### 2:
Changed to XML, since last comma in JSON is not merge-friendly.

### 1:
First version of format.