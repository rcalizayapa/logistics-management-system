type EventHandler = (payload: any) => void;

export class EventBus {

  private listeners: Map<string, EventHandler[]> = new Map();

  subscribe(event: string, handler: EventHandler): void {

    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }

    this.listeners.get(event)!.push(handler);
  }

  publish(event: string, payload: any): void {

    const handlers = this.listeners.get(event);
    if (!handlers) return;

    for (const handler of handlers) {
      handler(payload);
    }
  }
}