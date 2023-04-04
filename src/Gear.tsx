import {Circle, Line, Node, NodeProps} from '@motion-canvas/2d/lib/components';
import {
  CanvasStyleSignal,
  canvasStyleSignal,
  initial,
  signal,
} from '@motion-canvas/2d/lib/decorators';
import {PossibleCanvasStyle} from '@motion-canvas/2d/lib/partials';
import {
  createSignal,
  SignalValue,
  SimpleSignal,
} from '@motion-canvas/core/lib/signals';

export interface StrutConfig {
  /**
   * The amount of structs to appear.
   */
  struts: number;

  /**
   * A width factor to change the overall width of each strut.
   */
  widthFactor: number;

  /**
   * The diameter of the concentric circle.
   */
  concenctricDiameter?: number;

  /**
   * A factor for the thickness of the concentric circle, which is based on the diameter.
   */
  concentricThicknessFactor?: number;
}

const DEFAULT_STRUT_CFG: StrutConfig = {
  struts: 0,
  widthFactor: 1,
  concenctricDiameter: 0,
  concentricThicknessFactor: 1,
};

export interface GearProps extends NodeProps {
  /**
   * The diameter of the gear.
   */
  diameter: SignalValue<number>;

  /**
   * The amount of teeth to appear on the gear. The lowest possible value is 4.
   */
  teeth: SignalValue<number>;

  /**
   * How much scaling to do on the height of the teeth. The height of the teeth is
   * determined by the current diameter and thickness.
   */
  teethHeightFactor?: SignalValue<number>;

  /**
   * The closeness factor between the teeth.
   */
  teethClosenessFactor?: SignalValue<number>;

  /**
   * How "sharp" or "dull" the gear teeth appear. A value of `0` is completely
   * triangular, while values `> 0` give a more trapezoidal/rectangular appearance
   * to the teeth.
   */
  teethSquareness?: SignalValue<number>;

  /**
   * The overall thickness of the gear.
   */
  thickness?: SignalValue<number>;

  /**
   * The strut configuration.
   */
  struts?: SignalValue<StrutConfig>;

  /**
   * The color of the gear, struts, and inner circle.
   */
  color?: SignalValue<PossibleCanvasStyle>;
}

export class Gear extends Node {
  @signal()
  public declare readonly diameter: SimpleSignal<number, this>;

  @signal()
  public declare readonly teeth: SimpleSignal<number, this>;

  @initial(1)
  @signal()
  public declare readonly teethHeightFactor: SimpleSignal<number, this>;

  @initial(1)
  @signal()
  public declare readonly teethClosenessFactor: SimpleSignal<number, this>;

  @initial(1)
  @signal()
  public declare readonly teethSquareness: SimpleSignal<number, this>;

  @initial(1)
  @signal()
  public declare readonly thickness: SimpleSignal<number>;

  @initial(DEFAULT_STRUT_CFG)
  @signal()
  public declare readonly struts: SimpleSignal<StrutConfig>;

  @initial('#ffffff')
  @canvasStyleSignal()
  public declare readonly color: CanvasStyleSignal<this>;

  private readonly magnitude: SimpleSignal<number, this> = createSignal(
    () => (this.diameter() + this.teethThickness()) / 2,
  );

  private readonly teethWidth: SimpleSignal<number, this> = createSignal(
    () => (2 * Math.PI * this.magnitude()) / (this.teeth() * 2),
  );

  private readonly teethRadianDiff: SimpleSignal<number, this> = createSignal(
    () => this.teethWidth() / this.magnitude(),
  );

  private readonly teethHeight: SimpleSignal<number, this> = createSignal(
    () =>
      ((this.diameter() + this.teethThickness()) / this.THICKNESS_RATIO) *
      this.teethHeightFactor(),
  );

  private readonly teethShape: SimpleSignal<number, this> = createSignal(
    () => this.teeth() * (Math.abs(this.teethSquareness()) + 2),
  );

  private readonly teethThickness: SimpleSignal<number, this> = createSignal(
    () => (this.diameter() * this.thickness()) / this.THICKNESS_RATIO,
  );

  private readonly teethCloseness: SimpleSignal<number, this> = createSignal(
    () => Math.PI / (100 - this.teethClosenessFactor() * 10),
  );

  private readonly concenctricCircleDiameter: SimpleSignal<number, this> =
    createSignal(() => {
      if (this.struts()) {
        return this.struts().concenctricDiameter ?? 0;
      }
      return 0;
    });

  private readonly concentricCircleThickness: SimpleSignal<number, this> =
    createSignal(() => {
      // Only give a thickness if the diameter is defined
      if (!this.struts() || !this.struts().concenctricDiameter) return -1;
      return (
        (this.struts().concenctricDiameter *
          (this.struts().concentricThicknessFactor ?? 1)) /
        this.THICKNESS_RATIO
      );
    });

  /**
   * A scaling factor that determines, with respect to the diameters, how an input value for gear thickness,
   * concentric circle thickness, and teeth thickness are all translated to the expected lineWidth values
   * for MC.
   */
  private THICKNESS_RATIO = 10;

  public constructor(props: GearProps) {
    super({
      ...props,
    });

    this.add(
      <>
        {/* Gear Body */}
        <Circle
          height={this.diameter}
          width={this.diameter}
          lineWidth={this.teethThickness}
          stroke={this.color}
        />
        {/* Gear Teeth */}
        <Node
          spawner={() => {
            const children: Node[] = [];
            for (
              let i = 0, st1 = 0;
              i < this.teeth() * 2 && this.teeth() >= 4;
              i += 2, st1 += this.teethRadianDiff() * 2
            ) {
              children.push(
                <Line
                  lineWidth={4}
                  stroke={this.color}
                  closed
                  fill={this.color}
                  points={() => {
                    const st2 =
                      st1 + this.teethRadianDiff() + this.teethCloseness();
                    const [et1, et2] = [
                      st1 + Math.PI / this.teethShape(),
                      st2 - Math.PI / this.teethShape(),
                    ];

                    return [
                      polarToCartesian(this.magnitude(), st1),
                      polarToCartesian(
                        this.magnitude() + this.teethHeight(),
                        et1,
                      ),
                      polarToCartesian(
                        this.magnitude() + this.teethHeight(),
                        et2,
                      ),
                      polarToCartesian(this.magnitude(), st2),
                    ];
                  }}
                />,
              );
            }
            return children;
          }}
        />
        {/* Concentric Circle */}
        <Node
          spawner={() => {
            return [
              <Circle
                stroke={this.color}
                lineWidth={this.concentricCircleThickness}
                width={this.concenctricCircleDiameter}
                height={this.concenctricCircleDiameter}
              />,
            ];
          }}
        />
        {/* Struts */}
        <Node
          spawner={() => {
            if (!this.struts() || this.struts().struts <= 1) return [];

            const strutLines: Node[] = [];
            for (
              let i = 0, st1 = 0;
              i < this.struts().struts && this.teeth() >= 4;
              i++, st1 += (2 * Math.PI) / this.struts().struts
            ) {
              const theta =
                st1 + this.teethRadianDiff() / 2 + this.teethCloseness() / 2;

              // Starting point of a strut
              const [x1, y1] = polarToCartesian(
                (this.concenctricCircleDiameter() -
                  this.concentricCircleThickness()) /
                  2,
                theta,
              );

              // Endpoint of a strut
              const [x2, y2] = polarToCartesian(this.diameter() / 2, theta);

              strutLines.push(
                <Line
                  lineWidth={() => {
                    const [[x1, y1], [x2, y2]] = [
                      polarToCartesian(this.magnitude(), st1),
                      polarToCartesian(
                        this.magnitude(),
                        st1 + this.teethRadianDiff() + this.teethCloseness(),
                      ),
                    ];

                    return (
                      this.struts().widthFactor *
                      Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2))
                    );
                  }}
                  stroke={this.color}
                  points={[
                    [x1, y1],
                    [x2, y2],
                  ]}
                />,
              );
            }
            return strutLines;
          }}
        />
      </>,
    );
  }

  /**
   * Crank the gear about the center. After a single crank, the gear should look no different.
   * The teeth will start and end in the same relative locations. If `amt` is provided, the gear
   * will rotate more than one interval at a time without decelerating.
   *
   * The gear by default cranks in the clockwise direction. Counterclockwise cranking can be achieved
   * by passing a negative value for `amt`.
   *
   * @param duration - The amount of time for a crank.
   * @param amt - The total rotations to occur in a single crank, and the overall direction of the crank (sign).
   */
  public *crank(duration: number, amt?: number) {
    yield* this.rotation(
      ((this.teethRadianDiff() * 180) / Math.PI) * (amt ?? 1) * 2 +
        this.rotation(),
      duration,
    );
  }
}

/**
 * Convert polar coordinates to cartesian coordinates.
 *
 * @param r - The radius.
 * @param theta - The angle in `radians`.
 * @returns A tuple of the [`x`, `y`] values.
 */
export const polarToCartesian = (
  r: number,
  theta: number,
): [number, number] => {
  return [r * Math.cos(theta), r * Math.sin(theta)];
};
