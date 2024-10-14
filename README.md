<div align="center">
  <img width="1000" alt="image" src="https://github.com/caido-community/.github/blob/main/content/banner.png?raw=true">

  <br />
  <br />
  <a href="https://github.com/caido-community" target="_blank">Github</a>
  <span>&nbsp;&nbsp;•&nbsp;&nbsp;</span>
  <a href="https://developer.caido.io/" target="_blank">Documentation</a>
  <span>&nbsp;&nbsp;•&nbsp;&nbsp;</span>
  <a href="https://links.caido.io/www-discord" target="_blank">Discord</a>
  <br />
  <hr />
</div>

# Notebook [![Twitter](https://img.shields.io/twitter/url/https/twitter.com/cloudposse.svg?style=social&label=Follow%20Me)](https://twitter.com/ninjeeter)

**Notebook** is a frontend note taking plugin for [Caido](https://github.com/caido).

This plugin gives you the ability to consolidate your notes as you work directly within the Caido application.

## Features/Abilities:

- Notes can be added manually or via highlight selecting and using the context menu shortcut.
- Easily send requests and responses to be added as note entries.
- Note entries include date and time stamps.
- If you were working within a Project when the note was added - the Project name will be included.
- Note row panes can be expanded/condensed.
- Add additional comments to the note entries - helpful for providing additional information on requests/responses.
- Notes are available globally across all Projects.
- Easily edit notes after they have been added.
- Delete individual notes or clear the entire table at once.

![image](https://raw.githubusercontent.com/caido-community/notebook/main/notebook_screenshot.png)

## Installation: Documentation Example

If you are looking for the version of the **Notebook** plugin created in the [documentation guide](https://docs.caido.io/guides/plugins/notebook.html):

1. Go to the [Notebook Releases tab](https://github.com/caido-community/notebook/releases) and download the latest `notebook_v1.0.0.zip` package.
2. In your Caido instance, navigate to the `Plugins` page, click `Install Package` and select the downloaded `notebook_v1.0.0.zip` package.
3. Done! 🎉

## Installation: Latest

For **Notebook** with additional features:

1. Go to the [Notebook Releases tab](https://github.com/caido-community/notebook/releases) and download the latest release.
2. In your Caido instance, navigate to the `Plugins` page, click `Install Package` and select the downloaded package.
3. Done! 🎉

## Instructions

### To add a note:
  1. Supply input in the textarea located at the bottom and click the `Add Note` button.
  2. Highlight select text within a request/response pane and click the `>_ Commands` button located at the topbar in the upper-right corner. Search/Select `Add Note to Notebook`.
  3. Highlight select text within a request/response pane and open the context menu by right-clicking. Hover over the `Plugins` item and select `Add Note to Notebook`.
  4. `CTRL+C` within request and response panes and `CTRL+V` into the textarea.

### To edit a note:
  1. Click inside the note column.
  2. Unfocus once done.

### To add a comment:
  1. Supply input in the textarea in the third column.
  2. Unfocus once done.
  
### To clear all notes:
  ***This will reset the notes in storage. This action cannot be undone.***
  1. Click the `>_ Commands` button located at the topbar in the upper-right corner. Search/Select `Clear Notes in Notebook`.

## Contribution

If you'd like to request a feature, suggest an improvement or report a bug - please [create a Github Issue](https://github.com/caido-community/notebook/issues).
