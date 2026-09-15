export class GachaFX {
  constructor(scene) {
    this.scene = scene;
    this._shader = null;
    this._time = 0;
  }

  PlayShader() {
    if (this._shader) return;

    const width = this.scene.scale.width;
    const height = this.scene.scale.height;

    // 'gachaPulse' resolves from this.cache.shader, populated by load.glsl in BootScene
    this._shader = this.scene.add.shader('gachaPulse', width / 2, height / 2, width, height);
    this._shader.setDepth(9999);

    this._shader.setUniform('uResolution.value', [width, height]);

    console.log("✅ GachaFX Shader Started!");
  }

  update(deltaSeconds) {
    if (this._shader) {
      this._time += deltaSeconds;
      this._shader.setUniform('uTime.value', this._time);
    } 
  }

  StopShader() {
    if (this._shader) {
      this._shader.destroy();
      this._shader = null;
      this._time = 0;
      console.log("🛑 GachaFX Shader Stopped!");
    }
  }
}