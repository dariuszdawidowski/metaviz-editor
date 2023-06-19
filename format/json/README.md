# Metaviz data JSON

    {
	    "format": "MetavizJSON",
	    "mimetype": "text/metaviz+json",
	    "version": 28,
	    "id": "...",
	    "updated": "...",
        "name": "...",
	    "nodes": [
	        {
	            "id": "...",
	            "parent": "...",
	            "type": "...",
	            "params": {...} [optional]
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
