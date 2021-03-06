import Vue from 'vue';
import Component from 'vue-class-component';
import { Inject } from 'vue-property-decorator';
import Icon from './Icon';
import Button from './Button';
import Progress from './Progress';
import Touch, { PointerEventInput } from './Touch';

@Component
export default class Controller extends Vue {
  @Inject()
  private readonly aplayer!: {
    media: Media;
    currentTheme: string;
    currentVolume: number;
    currentPlayed: number;
    currentLoop: APlayer.LoopMode;
    currentOrder: APlayer.OrderMode;
  };

  @Inject() private handleSkipBack!: () => void;
  @Inject() private handleSkipForward!: () => void;
  @Inject() private handleTogglePlay!: () => void;
  @Inject() private handleToggleOrderMode!: () => void;
  @Inject() private handleToggleLoopMode!: () => void;
  @Inject() private handleTogglePlaylist!: () => void;
  @Inject() private handleToggleLyric!: () => void;
  @Inject() private handleChangeVolume!: (volume: number) => void;

  private get playIcon(): string {
    return this.aplayer.media.paused ? 'play' : 'pause';
  }

  private get volumeIcon(): string {
    const { currentVolume } = this.aplayer;
    return currentVolume <= 0 ? 'off' : currentVolume >= 0.95 ? 'up' : 'down'; // eslint-disable-line no-nested-ternary
  }

  private get ptime(): string {
    const { media, currentPlayed } = this.aplayer;
    return this.timeSecondsFormat(currentPlayed * media.duration);
  }

  private get dtime(): string {
    return this.timeSecondsFormat(this.aplayer.media.duration);
  }

  // eslint-disable-next-line class-methods-use-this
  private timeSecondsFormat(time: number = 0): string {
    const minutes = Math.floor(time / 60) || 0;
    const seconds = Math.floor(time % 60) || 0;
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`; // prettier-ignore
  }

  private handleToggleVolume() {
    // TODO: 恢复音量时应读取 localStorage 中记录的 volume
    this.handleChangeVolume(this.aplayer.currentVolume > 0 ? 0 : 0.7);
  }

  private handleClickVolumeBar(e: MouseEvent) {
    this.handlePanMove(e);
  }

  private handlePanMove(e: MouseEvent | PointerEventInput) {
    const target = this.$refs.volumeBar as HTMLElement;
    const targetTop = target.getBoundingClientRect().bottom;
    if (targetTop <= 0) return; // 音量控制面板已隐藏
    const clientY =
      e.type === 'panmove'
        ? (e as PointerEventInput).center.y
        : (e as MouseEvent).clientY;
    const offsetTop = Math.round(targetTop - clientY);
    let volume = offsetTop / target.offsetHeight;
    if (volume > 1) volume = 1;
    if (volume < 0) volume = 0;
    this.handleChangeVolume(volume);
  }

  render() {
    const { ptime, dtime, volumeIcon } = this;
    const {
      media,
      currentTheme,
      currentVolume,
      currentOrder,
      currentLoop,
    } = this.aplayer;

    return (
      <div class="aplayer-controller">
        <Progress />
        <div class="aplayer-time">
          <span class="aplayer-time-inner">
            <span class="aplayer-ptime">{ptime}</span> /{' '}
            <span class="aplayer-dtime">{dtime}</span>{' '}
          </span>
          <span
            class="aplayer-icon aplayer-icon-back"
            onClick={this.handleSkipBack}
          >
            <Icon type="skip" />
          </span>
          <span
            class="aplayer-icon aplayer-icon-play"
            onClick={this.handleTogglePlay}
          >
            <Icon type={this.playIcon} />
          </span>
          <span
            class="aplayer-icon aplayer-icon-forward"
            onClick={this.handleSkipForward}
          >
            <Icon type="skip" />
          </span>
          <div class="aplayer-volume-wrap">
            <Button
              type={`volume-${volumeIcon}`}
              icon={`volume-${volumeIcon}`}
              onClick={this.handleToggleVolume}
            />
            <Touch onPanMove={this.handlePanMove}>
              <div
                class="aplayer-volume-bar-wrap"
                onClick={this.handleClickVolumeBar}
              >
                <div
                  ref="volumeBar"
                  class="aplayer-volume-bar"
                  onClick={this.handleClickVolumeBar}
                >
                  <div
                    class="aplayer-volume"
                    style={{
                      height: `${currentVolume * 100}%`,
                      backgroundColor: currentTheme,
                    }}
                  />
                </div>
              </div>
            </Touch>
          </div>{' '}
          <Button
            type="order"
            icon={`order-${currentOrder}`}
            onClick={this.handleToggleOrderMode}
          />{' '}
          <Button
            type="loop"
            icon={`loop-${currentLoop}`}
            onClick={this.handleToggleLoopMode}
          />{' '}
          <Button type="menu" icon="menu" onClick={this.handleTogglePlaylist} />
          <Button type="lrc" icon="lrc" onClick={this.handleToggleLyric} />
        </div>
      </div>
    );
  }
}
