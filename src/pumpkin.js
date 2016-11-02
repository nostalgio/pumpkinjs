/* Originally the `Data View Interact` library
 * Created to simplify RESTful activity
 * Heavily modified by Josh Wedekind at Nostalg.io
 * To add Signals/Slots capabilities to Backbone.js
*/

class PumpkinEvent {
    constructor() {
        this.callbacks = [];
    }

    add(callbackObject) {
        let index = this.callbacks.push(callbackObject) - 1;
        return index;
    }

    squash(index) {
        delete this.callbacks[index];
    }
}


export class Pumpkin {
    constructor(namespace = 'PumpkinPatch') {
        this.setupProperties(namespace);
    }

    setupProperties(namespace) {
        let globalObj;
        if (typeof window !== 'undefined') {
            globalObj = window;
        } else {
            globalObj = global;
        }
        this.patch = globalObj;
        // Set to any existing PumpkinJS instances,
        // Or start a new one.
        if (typeof this.patch[namespace] === 'undefined') {
            this.patch[namespace] = {};
        }
        this.vine = this.patch[namespace];
    }

    getEvent(eventName) {
        let event = this.vine[eventName];
        if (typeof event !== 'undefined') {
            return event;
        } else {
            return null;
        }
    }

    getOrCreateEvent(eventName) {
        let event = this.getEvent(eventName);
        if (event === null) {
            event = this.vine[eventName] = new PumpkinEvent();
        }
        return event;
    }

    signal(eventName, data = {}) {
        let event = this.getEvent(eventName);
        if (event !== null && event.hasOwnProperty('callbacks')) {
            this.makePie(event.callbacks, data);
        }
    }

    slot(eventName, callback, scope = this.patch) {
        let event = this.getOrCreateEvent(eventName);

        if (eventName && typeof callback === 'function') {
            let index = event.add({
                crust: scope,
                recipe: callback
            });
            return index;
        } else {
            return null;
        }
    }

    makePie(callbacks, ingredients) {
        callbacks.forEach( (callback) => {
            if (typeof callback.recipe === 'function') {
                callback.recipe.call(callback.crust, ingredients);
            }
        });
    }

    squash(eventName) {
        if (eventName && this.getEvent(eventName) !== null) {
            delete this.vine[eventName];
        }
    }
}
