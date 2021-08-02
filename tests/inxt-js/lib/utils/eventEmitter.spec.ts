import { spy } from 'sinon';
import { EventEmitter } from '../../../../src/inxt-js/lib/utils/eventEmitter';

let emitter: EventEmitter;

beforeEach(() => {
  emitter = new EventEmitter();
});

describe('# lib/utils/EventEmitter', () => {
  describe('on()', () => {
    it('Should attach each event with a listener', () => {
      const listenerOne = () => {};
      const eventOne = 'eventOne';
      const listenerTwo = () => {};
      const eventTwo = 'eventTwo';

      emitter.on(eventOne, listenerOne);
      emitter.on(eventTwo, listenerTwo);

      expect(emitter.getListeners(eventOne)).toStrictEqual([listenerOne]);
      expect(emitter.getListeners(eventTwo)).toStrictEqual([listenerTwo]);
    });

    it('Should attach multiple listeners to an event', () => {
      const listenerA = () => {};
      const listenerB = () => null;
      const event = 'event';

      emitter.on(event, listenerA);
      emitter.on(event, listenerB);

      expect(emitter.getListeners(event)).toStrictEqual([listenerA, listenerB]);
    });
  });

  describe('getListeners()', () => {
    it('Should return empty if that event does not exist', () => {
      expect(emitter.getListeners('fakevent')).toStrictEqual([]);
    });

    it('Should return empty if that event does not have listeners', () => {
      const event = 'event';
      const listener = () => {};

      emitter.on(event, listener);
      emitter.removeListener(event, listener);

      expect(emitter.getListeners(event)).toStrictEqual([]);
    });

    it('Should return all listeners related to an event', () => {
      const listenerA = () => 0;
      const listenerB = () => 1;
      const listenerC = () => 2;
      const event = 'event';

      emitter.on(event, listenerA);
      emitter.on(event, listenerB);
      emitter.on(event, listenerC);

      expect(emitter.getListeners(event)).toStrictEqual([listenerA, listenerB, listenerC]);
    });
  });

  describe('emit()', () => {
    it('Should call to all listeners of an event', () => {
      const listenerA = spy();
      const listenerB = spy();
      const listenerC = spy();
      const event = 'event';
      const argument = 3;

      emitter.on(event, listenerA);
      emitter.on(event, listenerB);
      emitter.on(event, listenerC);
      emitter.emit(event, argument);

      expect(listenerA.callCount).toEqual(1);
      expect(listenerB.callCount).toEqual(1);
      expect(listenerC.callCount).toEqual(1);
      expect(listenerA.args.length).toEqual(1);
      expect(listenerB.args.length).toEqual(1);
      expect(listenerC.args.length).toEqual(1);
      expect(listenerA.args[0]).toStrictEqual([argument]);
      expect(listenerB.args[0]).toStrictEqual([argument]);
      expect(listenerC.args[0]).toStrictEqual([argument]);
    });
  });

  describe('removeAllListeners()', () => {
    it('Should handle if no events are registered', () => {
      expect(() => emitter.removeAllListeners()).not.toThrow();
    });

    it('Should remove all events', () => {
      emitter.on('fakevent', () => {});
      emitter.on('fakevent2', () => {});

      expect(emitter.eventsCount()).toEqual(2);

      emitter.removeAllListeners();

      expect(emitter.eventsCount()).toEqual(0);
    });
  });
});