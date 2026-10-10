# JSON data exchange with an AI agent

{
    "nodes": [ // OPTIONAL
        {
            "id": "...",
            "parent": "...",
            "type": "...",
            "params": {...}
            "x": ...,
            "y": ...,
            "z": ..., // OPTIONAL
            "w": ...,
            "h": ...
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
    ],
    "msg": "...", // OPTIONAL / ANSWER ONLY
    "centre": {"x": ..., "y": ...} // OPTIONAL / ANSWER ONLY
 }
