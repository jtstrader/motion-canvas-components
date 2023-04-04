import {makeScene2D} from '@motion-canvas/2d/lib/scenes';
import {waitFor} from '@motion-canvas/core/lib/flow';
import {Gear, StrutConfig} from '@components/Gear';
import {createRef} from '@motion-canvas/core/lib/utils';

export default makeScene2D(function* (view) {
  const ref = createRef<Gear>();

  const scfg: StrutConfig = {
    struts: 5,
    widthFactor: 0.5,
    concenctricDiameter: 100,
    concentricThicknessFactor: 2,
  };

  view.add(<Gear ref={ref} diameter={300} teeth={10} />);

  yield* ref().struts(scfg, 4);

  yield* waitFor(5);
});
