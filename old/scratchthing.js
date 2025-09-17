class ScratchThing {
    constructor() {
    }
    
    getInfo() {
        return {
            "id": "ScratchThing",
            "name": "Scratch Thing",
            "blocks": [  {
                            "opcode": "scratchDays",
                            "blockType": "reporter",
                            "text": "Scratch Days",
                            "arguments": {}, ]
        }
    }

    /* add methods for blocks */
}

Scratch.extensions.register(new ScratchFetch())
