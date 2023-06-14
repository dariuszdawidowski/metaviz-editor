# Metaviz data JSON

    {
	    "format": "MetavizJSON",
	    "mimetype": "text/metaviz+json",
	    "version": 27,
	    "id": "...",
	    "updated": "...",
        "name": "...",
	    "nodes": [
	        {
	            "id": "...",
	            "parent": "...",
	            "type": "...",
	            "data": {...} [optional]
	        },
	        ...
	    ],
	    "layers": [
	        {
	            "id": "...",
	            "name": "...",
	            "nodes": [
	                {
	                    "id": "...",
	                    "x": ...,
	                    "y": ...,
	                    "w": ..., [optional]
	                    "h": ..., [optional]
	                    "scale": ..., [optional]
	                    "locked": ...
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
	    "undo": { [optional]
	    	"history": [...],
	    	"future": [...]
	    }
	}
