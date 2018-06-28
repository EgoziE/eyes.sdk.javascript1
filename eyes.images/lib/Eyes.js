'use strict';

const {
  ArgumentGuard,
  GeneralUtils,
  EyesBase,
  EyesError,
  ImageUtils,
  RegionProvider,
  MutableImage,
  RectangleSize,
  NullRegionProvider,
  EyesSimpleScreenshot,
} = require('@applitools/eyes.sdk.core');

const { Target } = require('./fluent/Target');
const VERSION = require('../package.json').version;

/**
 * The main type - to be used by the users of the library to access all functionality.
 */
class Eyes extends EyesBase {
  /**
   * Initializes an Eyes instance.
   *
   * @param {string} [serverUrl=EyesBase.getDefaultServerUrl()] The Eyes server URL.
   * @param {PromiseFactory} [promiseFactory] If not specified will be created using `Promise` object
   */
  constructor(serverUrl, promiseFactory) {
    super(serverUrl, false, promiseFactory);

    this._title = undefined;
    this._screenshot = undefined;
    this._screenshotUrl = undefined;
    this._inferred = '';
  }

  /** @override */
  getBaseAgentId() {
    return `eyes.images/${VERSION}`;
  }

  /**
   * Starts a test.
   *
   * @param {string} appName The application being tested.
   * @param {string} testName The test's name.
   * @param {RectangleSize} [imageSize] Determines the resolution used for the baseline. {@code null} will
   *   automatically grab the resolution from the image.
   * @return {Promise<void>}
   */
  open(appName, testName, imageSize) {
    return super.openBase(appName, testName, imageSize);
  }

  /**
   * @param {string} name
   * @param {ImagesCheckSettings} checkSettings
   * @return {Promise<boolean>}
   */
  check(name, checkSettings) {
    ArgumentGuard.notNull(checkSettings, 'checkSettings');

    if (this.getIsDisabled()) {
      this._logger.verbose(`check('${name}', checkSettings): Ignored`);
      return this.getPromiseFactory().resolve(false);
    }

    return this._checkImage(name, false, checkSettings);
  }

  /**
   * Perform visual validation for the current image.
   *
   * @param {string|Buffer|MutableImage} image The image path, base64 string, image buffer or MutableImage.
   * @param {string} [tag] Tag to be associated with the validation checkpoint.
   * @param {boolean} [ignoreMismatch] True if the server should ignore a negative result for the visual validation.
   * @param {number} [retryTimeout] timeout for performing the match (ms).
   * @return {Promise<boolean>} True if the image matched the expected output, false otherwise.
   * @throws {DiffsFoundError} Thrown if a mismatch is detected and immediate failure reports are enabled.
   */
  checkImage(image, tag, ignoreMismatch, retryTimeout) {
    if (this.getIsDisabled()) {
      this._logger.verbose(`checkImage(Image, '${tag}', '${ignoreMismatch}', '${retryTimeout}'): Ignored`);
      return this.getPromiseFactory().resolve(false);
    }

    ArgumentGuard.notNull(image, 'image cannot be null!');

    this._logger.verbose(`checkImage(Image, '${tag}', '${ignoreMismatch}', '${retryTimeout}')`);
    // noinspection JSCheckFunctionSignatures
    return this._checkImage(tag, ignoreMismatch, Target.image(image).timeout(retryTimeout));
  }

  /**
   * Perform visual validation for the current image.
   *
   * @param {Region|RegionObject} region The region of the image which should be verified, or {undefined}/{null} if the
   *   entire image should be verified.
   * @param {string|Buffer|MutableImage} image The image path, base64 string, image buffer or MutableImage.
   * @param {string} [tag] An optional tag to be associated with the validation checkpoint.
   * @param {boolean} [ignoreMismatch] True if the server should ignore a negative result for the visual validation.
   * @param {number} [retryTimeout] timeout for performing the match (ms).
   * @return {Promise<boolean>} True if the image matched the expected output, false otherwise.
   * @throws {DiffsFoundError} Thrown if a mismatch is detected and immediate failure reports are enabled.
   */
  checkRegion(image, region, tag, ignoreMismatch, retryTimeout) {
    ArgumentGuard.notNull(image, 'image');
    ArgumentGuard.notNull(region, 'region');

    if (this.getIsDisabled()) {
      this._logger.verbose(`checkRegion(Image, [${region}], '${tag}', '${ignoreMismatch}', '${retryTimeout}'): Ignored`);
      return this.getPromiseFactory().resolve(false);
    }

    this._logger.verbose(`checkRegion(Image, [${region}], '${tag}', '${ignoreMismatch}', '${retryTimeout}')`);
    // noinspection JSCheckFunctionSignatures
    return this._checkImage(tag, ignoreMismatch, Target.region(image, region).timeout(retryTimeout));
  }

  /**
   * Internal function for performing an image verification for an image (or a region of an image).
   *
   * @private
   * @param {string} name An optional tag to be associated with the validation checkpoint.
   * @param {boolean} ignoreMismatch True if the server should ignore a negative result for the visual validation.
   * @param {ImagesCheckSettings} checkSettings The settings to use when checking the image.
   * @return {Promise<boolean>}
   */
  _checkImage(name, ignoreMismatch, checkSettings) {
    const that = this;
    let regionProvider = new NullRegionProvider(that.getPromiseFactory());
    return this.getPromiseFactory().resolve()
      .then(() => {
        // Set the title to be linked to the screenshot.
        that._title = name || '';

        if (checkSettings.getImageUrl()) {
          that._screenshotUrl = checkSettings.getImageUrl();
          if (!that._viewportSizeHandler.get() && checkSettings.getImageSize()) {
            return that.setViewportSize(checkSettings.getImageSize());
          }
        } else {
          if (checkSettings.getTargetRegion()) {
            regionProvider = new RegionProvider(checkSettings.getTargetRegion(), that.getPromiseFactory());
          }

          return this._normalizeImage(checkSettings).then(image => {
            that._screenshot = new EyesSimpleScreenshot(image);
            if (!that._viewportSizeHandler.get()) {
              return that.setViewportSize(image.getSize());
            }
          });
        }
      })
      .then(() => super.checkWindowBase(regionProvider, name, ignoreMismatch, checkSettings))
      .then(/** MatchResult */ mr => {
        that._screenshotUrl = null;
        that._screenshot = null;
        that._title = null;
        return mr.getAsExpected();
      });
  }

  /**
   * @private
   * @param {ImagesCheckSettings} checkSettings The settings to use when checking the image.
   * @return {Promise<MutableImage>}
   */
  _normalizeImage(checkSettings) {
    const promiseFactory = this.getPromiseFactory();
    return promiseFactory.makePromise((resolve, reject) => {
      if (checkSettings.getMutableImage()) {
        return resolve(checkSettings.getMutableImage());
      }

      if (checkSettings.getImageBuffer()) {
        return resolve(new MutableImage(checkSettings.getImageBuffer(), promiseFactory));
      }

      if (checkSettings.getImageString()) {
        return resolve(MutableImage.fromBase64(checkSettings.getImageString(), promiseFactory));
      }

      if (checkSettings.getImagePath()) {
        return ImageUtils.readImage(checkSettings.getImagePath(), promiseFactory)
          .then(data => resolve(new MutableImage(data, promiseFactory)))
          .catch(err => reject(new EyesError(`Can't read image [${err.message}]`)));
      }

      return reject(new EyesError("Can't recognize supported image from checkSettings."));
    });
  }

  // noinspection JSUnusedGlobalSymbols
  /**
   * Replaces the actual image in a running session.
   *
   * @param {number} stepIndex The zero based index of the step in which to replace the image.
   * @param {string|Buffer|MutableImage} image The image base64 string, image buffer or MutableImage.
   * @param {string} [tag] A tag to be associated with the validation checkpoint.
   * @param {string} [title] A title to be associated with the validation checkpoint.
   * @param {Trigger[]} [userInputs] An array of user inputs to which lead to the validation checkpoint.
   * @return {Promise<boolean>} True if the image matched the expected output, false otherwise.
   * @throws {DiffsFoundError} Thrown if a mismatch is detected and immediate failure reports are enabled.
   */
  replaceImage(stepIndex, image, tag, title, userInputs) {
    ArgumentGuard.notNull(stepIndex, 'stepIndex');
    ArgumentGuard.notNull(image, 'image');

    if (this.getIsDisabled()) {
      this._logger.verbose(`replaceImage('${stepIndex}', Image, '${tag}', '${title}', '${userInputs}'): Ignored`);
      return this.getPromiseFactory().resolve(false);
    }

    if (GeneralUtils.isBuffer(image) || GeneralUtils.isString(image)) {
      image = new MutableImage(image, this.getPromiseFactory());
    }

    this._logger.verbose(`replaceImage('${stepIndex}', Image, '${tag}', '${title}', '${userInputs}')`);
    return super.replaceWindow(stepIndex, image, tag, title, userInputs).then(results => results.getAsExpected());
  }

  // noinspection JSUnusedGlobalSymbols
  /**
   * Adds a mouse trigger.
   *
   * @param {MouseTrigger.MouseAction} action  Mouse action.
   * @param {Region} control The control on which the trigger is activated (context relative coordinates).
   * @param {Location} cursor  The cursor's position relative to the control.
   */
  addMouseTrigger(action, control, cursor) {
    super.addMouseTriggerBase(action, control, cursor);
  }

  // noinspection JSUnusedGlobalSymbols
  /**
   * Adds a keyboard trigger.
   *
   * @param {Region} control The control's context-relative region.
   * @param {string} text The trigger's text.
   */
  addTextTrigger(control, text) {
    super.addTextTriggerBase(control, text);
  }

  // noinspection JSUnusedGlobalSymbols
  /**
   * Get the AUT session id.
   *
   * @return {Promise<?string>}
   */
  getAUTSessionId() {
    return this.getPromiseFactory().resolve(undefined);
  }

  // noinspection JSUnusedGlobalSymbols
  /**
   * Get the viewport size.
   *
   * @return {Promise<RectangleSize>}
   */
  getViewportSize() {
    return this.getPromiseFactory().resolve(this._viewportSizeHandler.get());
  }

  // noinspection JSUnusedGlobalSymbols
  /**
   * Set the viewport size.
   *
   * @param {RectangleSize} viewportSize The required viewport size.
   * @return {Promise<void>}
   */
  setViewportSize(viewportSize) {
    ArgumentGuard.notNull(viewportSize, 'size');

    this._viewportSizeHandler.set(new RectangleSize(viewportSize));
    return this.getPromiseFactory().resolve();
  }

  // noinspection JSUnusedGlobalSymbols
  /**
   * Get the inferred environment.
   *
   * @protected
   * @return {Promise<string>} A promise which resolves to the inferred environment string.
   */
  getInferredEnvironment() {
    return this.getPromiseFactory().resolve(this._inferred);
  }

  // noinspection JSUnusedGlobalSymbols
  /**
   * Sets the inferred environment for the test.
   *
   * @param {string} inferred The inferred environment string.
   */
  setInferredEnvironment(inferred) {
    this._inferred = inferred;
  }

  // noinspection JSUnusedGlobalSymbols
  /**
   * Get the screenshot.
   *
   * @return {Promise<EyesSimpleScreenshot>} The screenshot.
   */
  getScreenshot() {
    return this.getPromiseFactory().resolve(this._screenshot);
  }

  // noinspection JSUnusedGlobalSymbols
  /**
   * Get the screenshot URL.
   *
   * @return {Promise<string>} The screenshot URL.
   */
  getScreenshotUrl() {
    return this.getPromiseFactory().resolve(this._screenshotUrl);
  }

  // noinspection JSUnusedGlobalSymbols
  /**
   * Get the title.
   *
   * @protected
   * @return {Promise<string>} The current title of of the AUT.
   */
  getTitle() {
    return this.getPromiseFactory().resolve(this._title);
  }
}

exports.Eyes = Eyes;
