# Metaviz history stack format

    <mv>
        <format>MetavizStack</format>
        <mimetype>text/mvstack+xml</mimetype>
        <version>6</version>
	    <id></id>
        <name></name>
	    <history>
	        <session id="">
		        <add timestamp="" node="id" type="" x="" y="" w="" h="" param-*=""/>
		        <add timestamp="" link="id" type="" start="" end=""/>
		        <del timestamp="" nodes="id,..."/>
		        <del timestamp="" links="id,..."/>
		        <move timestamp="" nodes="id,..." offset-x="" offset-y="" position-x="" position-y=""/>
		        <resize timestamp="" nodes="id,..." w="" h=""/>
		        <param timestamp="" node="" param-*=""/>
	        </session>
	        <session id="">
	            ...
	        </session>
	    </history>
	</mv>

## Changelog:

### 6:
Change data- to param-.

### 5:
Added mimetype.

### 4:
Strip json to separate xml attributes.

### 3:
Added sessions sections for auto-merge.

### 2:
Changed to XML, since last comma in JSON is not merge-friendly.

### 1:
First version of format.