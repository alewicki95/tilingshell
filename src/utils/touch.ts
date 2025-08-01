import { Clutter, St } from '@gi.ext';

export default class TouchEventHelper {
    private readonly TOUCH_SCROLL_THRESHOLD = 10;

    private _touchStartY: number | null = null;
    private _touchMoved: boolean = false;
    private _scrollStartY: number = 0;
    private _isDragging: boolean = false;

    private _actor: Clutter.Actor;

    constructor(actor: Clutter.Actor) {
        this._actor = actor;
    }

    convertTapToButtonPress(event: Clutter.Event): boolean {
        const eventType = event.type();
        const [, y] = event.get_coords();

        switch (eventType) {
            case Clutter.EventType.TOUCH_BEGIN:
                this._touchStartY = y;
                this._isDragging = false;
                return Clutter.EVENT_PROPAGATE;
            case Clutter.EventType.TOUCH_UPDATE:
                if (this._touchStartY !== null) {
                    const deltaY = Math.abs(y - this._touchStartY);
                    if (deltaY > this.TOUCH_SCROLL_THRESHOLD)
                        this._isDragging = true;
                }
                return Clutter.EVENT_PROPAGATE;

            case Clutter.EventType.TOUCH_END: {
                const wasTap = !this._isDragging;
                this._touchStartY = null;
                this._isDragging = false;

                if (wasTap) this._actor.emit('button-press-event', event);
                return Clutter.EVENT_STOP;
            }
            default:
                return Clutter.EVENT_PROPAGATE;
        }
    }

    convertPanToScroll(
        event: Clutter.Event,
        scrollView: St.ScrollView,
    ): boolean {
        const eventType = event.type();
        const [, y] = event.get_coords();

        switch (eventType) {
            case Clutter.EventType.TOUCH_BEGIN:
                this._touchStartY = y;
                this._scrollStartY = scrollView.vadjustment.value;
                this._isDragging = false;
                return Clutter.EVENT_STOP;

            case Clutter.EventType.TOUCH_UPDATE:
                if (this._touchStartY !== null) {
                    const deltaY = this._touchStartY - y;
                    const newScrollYValue = this._scrollStartY + deltaY;
                    const adjustment = scrollView.vadjustment;
                    const clampedValue = Math.max(
                        0,
                        Math.min(
                            newScrollYValue,
                            adjustment.upper - adjustment.page_size,
                        ),
                    );
                    adjustment.set_value(clampedValue);

                    if (Math.abs(deltaY) > this.TOUCH_SCROLL_THRESHOLD)
                        this._isDragging = true;
                }
                return Clutter.EVENT_STOP;

            case Clutter.EventType.TOUCH_END: {
                const wasDragging = this._isDragging;
                this._touchStartY = null;
                this._isDragging = false;

                // Propagate touch event if we weren't dragging
                return wasDragging
                    ? Clutter.EVENT_STOP
                    : Clutter.EVENT_PROPAGATE;
            }

            default:
                return Clutter.EVENT_PROPAGATE;
        }
    }
}
