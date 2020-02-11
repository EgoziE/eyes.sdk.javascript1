## 1.3.5 - 2020-02-10

- update SDK version to 5.9.12

## 1.3.4 - 2020-02-09
- added missing require for ConsoleLogHandler
- exported By and Target from eyes-webdriverio so they can be required directly from this package instead
- updated the version of eyes-webdriverio to latest

## [1.2.3] - 2019-11-09 
### Fixed
- Setting viewportSize through configuration. [Ticket 1168](https://trello.com/c/yPqI3erm)
- Set appName from describe tag. [Ticket 1174](https://trello.com/c/gIlKtwZU)
- Fix css stitching for new chrome 78 (bug in chrome). [Trello 1206](https://trello.com/c/euVqe1Sv)

## [1.2.2] - 2019-10-24
### Fixed
- Updated dependencies for underlying ignore regions fix. [Ticket](https://trello.com/c/E97HesbG)

## [1.2.1] - 2019-09-26
### Added
- This changelog file.
### Fixed
- Setting scroll root element only after `open` is called. [Ticket](https://trello.com/c/0NRouZgA)
- Test name taken from each test, not just the first one.  [Ticket](https://trello.com/c/eOhBTH5r), [Ticket](https://trello.com/c/0NRouZgA)

## [1.2.0] - 2019-09-14
### Added
- Added access to the configuration using the `eyesGetConfiguration()`/`eyesSetConfiguration()` commands.
- Added access to the test results per test and per suite (`eyesGetTestResults` and `eyesGetAllTestsResults` commands).

## [1.1.0] - 2019-08-06
### Added
- Added `eyesSetScrollRootElement` command.

## [1.0.1] - 2019-05-19
### Added
- First release.
 
 