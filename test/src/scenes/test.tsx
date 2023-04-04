import {makeScene2D} from '@motion-canvas/2d/lib/scenes';
import {waitFor} from '@motion-canvas/core/lib/flow';
import {Gear} from '@components/Gear';

export default makeScene2D(function* (view) {
  // Create your animations here
  view.add(<Gear diameter={300} teeth={10} />);
  yield* waitFor(5);
});
