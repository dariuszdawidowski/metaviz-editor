# Metaviz data JSON

    {
	    "format": "MetavizJSON",
	    "mimetype": "text/metaviz+json",
	    "version": 40,
	    "id": "...", // OPTIONAL
        "name": "...",
		"updated": ..., // OPTIONAL
	    "nodes": [
	        {
	            "id": "...",
	            "parent": "...",
	            "type": "...",
	            "params": {...}
				"x": ..., // OPTIONAL
				"y": ..., // OPTIONAL
				"z": ..., // OPTIONAL
				"w": ..., // OPTIONAL
				"h": ...  // OPTIONAL
	        },
	        ...
	    ],
		"links": [ // OPTIONAL
			{
				"id": "...",
				"type": "...",
				"start": "...",
				"end": "..."
			},
			...
		]
	    "layers": [ // OPTIONAL
	        {
	            "id": "...",
	            "name": "...",
	            "nodes": [
	                {
	                    "id": "...",
	                    "x": ...,
	                    "y": ...,
                        "z": ..., // OPTIONAL
	                    "w": ..., // OPTIONAL
	                    "h": ...  // OPTIONAL
	                },
	                ...
	            ],
	            "links": [
	                {
	                    "id": "...",
	                    "type": "...",
	                    "start": "...",
	                    "end": "..."
	                },
	                ...
	            ]
	        },
	        ...
	    ],
	    "undo": { // OPTIONAL
	    	"history": [...],
	    	"future": [...]
	    }
	}
