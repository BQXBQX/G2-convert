type EventCallback = (...args: unknown[]) => void;

export class EventEmitter {
  private events: Map<string, EventCallback[]>;

  constructor() {
    this.events = new Map();
  }

  on(eventName: string, callback: EventCallback): void {
    if (!this.events.has(eventName)) {
      this.events.set(eventName, []);
    }
    this.events.get(eventName)?.push(callback);
  }

  removeAllListeners(eventName?: string): void {
    if (eventName) {
      this.events.delete(eventName);
    } else {
      this.events.clear();
    }
  }

  off(eventName: string, callback: EventCallback): void {
    if (!this.events.has(eventName)) return;

    const callbacks = this.events.get(eventName);
    const index = callbacks?.indexOf(callback);
    if (index !== -1 && index !== undefined) {
      callbacks?.splice(index, 1);
    }

    if (callbacks?.length === 0) {
      this.events.delete(eventName);
    }
  }

  emit(eventName: string, ...args: unknown[]): void {
    if (!this.events.has(eventName)) return;

    const callbacks = this.events.get(eventName);
    for (const callback of callbacks || []) {
      try {
        callback(...args);
      } catch (error) {
        console.error(`Error in event listener for ${eventName}:`, error);
      }
    }
  }

  once(eventName: string, callback: EventCallback): void {
    const onceWrapper = (...args: unknown[]) => {
      callback(...args);
      this.off(eventName, onceWrapper);
    };
    this.on(eventName, onceWrapper);
  }
}

export default new EventEmitter();
