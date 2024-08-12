// Imports.
import type { Caido } from "@caido/sdk-frontend";

import type { PluginStorage } from "./types";

// Creates path.
const Page = "/notebook";
// Syntax of - identifier: "namespace.namespaceIdentifier".
const Commands = {
  clear: "notebook.clear",
  addNoteMenu: "notebook.addNoteMenu",
};

// Get notes from storage.
const getNotes = (caido: Caido): PluginStorage["notes"] => {
  const storage = caido.storage.get() as PluginStorage | undefined;
  return storage?.notes ?? [];
};

// Add note to storage.
const addNoteStorage = async (
  caido: Caido,
  datetime: string,
  note: string,
  projectName?: string,
  comment?: string,
) => {
  const currentNotes = getNotes(caido);
  const updatedNotes = [...currentNotes, { datetime, note, projectName, comment: "" }];
  await caido.storage.set({ notes: updatedNotes });

  // Print added note to console.
  console.log("Added Note:", { datetime, note, projectName });
};

// Global scope table.
const table = document.createElement("table");
table.id = "notesTable";

// Resetting the page table.
const clear = (caido: Caido) => {
  if (table) {
    const tbody = table.querySelector("tbody");
    if (tbody) {
      table.textContent = "";
    }
  }
  caido.storage.set({ notes: [] });
};

// Add note via prompt or highlight selecting text and selecting context menu option.
const addNoteMenu = async (caido: Caido) => {
  let currentSelect = caido.window.getActiveEditor()?.getSelectedText();

  if (!currentSelect) {
    currentSelect = prompt("No selection - enter note here:") as string;
  }

  if (currentSelect) {
    const project = await caido.graphql.currentProject();
    const projectData = project?.currentProject;
    if (projectData) {
      const projectName = projectData.name || "No Project Selected";
      const datetime = new Date().toLocaleString();

      // Add the note to storage.
      await addNoteStorage(caido, datetime, currentSelect, projectName);

      caido.window.showToast(`${currentSelect} added to Notebook.`, {variant: "info", duration: 5000})
    }
  }
};

// Plugin page construction.
const addPage = (caido: Caido) => {
  // Header.
  const headerText = document.createElement("h1");
  headerText.textContent = "Notebook";
  headerText.className = "center";

  // Instructions.
  const details = document.createElement("details");
  const summary = document.createElement("summary");
  summary.textContent = "Instructions";
  summary.classList.add("center", "bold-brown");
  details.appendChild(summary);

  const instructions = document.createElement("p");
  instructions.innerHTML = `<span class="bold-brown">To add a note:</span><br>
  1. Supply input in the textarea located at the bottom and click the <span class="light-brown">Add Note</span> button.<br>
  2. Highlight select text within a request/response pane and click the <span class="light-brown">>_ Commands</span> button located at the topbar in the upper-right corner. Search/Select <span class="light-brown">Add Note to Notebook</span>.<br>
  3. Highlight select text within a request/response pane and open the context menu by right-clicking. Hover over the <span class="light-brown">Plugins</span> item and select <span class="light-brown">Add Note to Notebook</span>.<br>
  4. <span class="light-brown">CTRL+C</span> within request and response panes and <span class="light-brown">CTRL+V</span> into the textarea.<br>
  <br>
  <span class="bold-brown">To edit a note:</span><br>
  1. Click inside the note column.<br>
  2. Unfocus once done.<br>
  <br>
  <span class="bold-brown">To add a comment:</span><br>
  1. Supply input in the textarea in the third column.<br>
  2. Unfocus once done.<br>
  <br>
  <span class="bold-brown">To clear all notes:</span><br>
  <span class="bold-red">***This will reset the notes in storage. This action cannot be undone.***</span><br>
  1. Click the <span class="light-brown">>_ Commands</span> button located at the topbar in the upper-right corner. Search/Select <span class="light-brown">Clear Notes in Notebook</span>.`;
  instructions.className = "center";

  details.appendChild(instructions);

  // Input textarea.
  const textarea = document.createElement("textarea");
  textarea.placeholder = "Enter note here...";
  textarea.classList.add("text-area");

  // `Add note.` button.
  const addNoteButton = caido.ui.button({
    variant: "primary",
    label: "Add Note",
  });

  addNoteButton.addEventListener("click", async () => {
    const datetime = new Date().toLocaleString();
    let inputValue = textarea.value;

    if (inputValue) {
      const project = await caido.graphql.currentProject();
      const projectData = project?.currentProject;
      const projectName = projectData?.name || "No Project Selected";

      // Add the note to storage.
      await addNoteStorage(caido, datetime, inputValue, projectName);

      // Clear textarea and reset value.
      inputValue = "";
      textarea.value = "";
    }
  });

  // Combining elements into divs since card properties cannot accept arrays.

  const headerContainer = document.createElement("div");
  headerContainer.appendChild(headerText);
  headerContainer.appendChild(details);

  const tableContainer = document.createElement("div");
  tableContainer.appendChild(table);
  tableContainer.classList.add("table-container");

  const buttonContainer = document.createElement("div");
  buttonContainer.appendChild(addNoteButton);
  buttonContainer.classList.add("button-container");

  const footerContainer = document.createElement("div");
  footerContainer.appendChild(textarea);
  footerContainer.appendChild(buttonContainer);

  // Card elements.
  const card = caido.ui.card({
    header: headerContainer,
    body: tableContainer,
    footer: footerContainer,
  });

  // Create plugin page in left tab menu.
  caido.navigation.addPage(Page, {
    body: card,
  });
};

const displayNotes = (caido: Caido, notes: PluginStorage["notes"] | undefined) => {
  const tbody = table.querySelector("tbody");
  if (tbody) {
    table.textContent = "";
  }

  if (!notes) {
    return;
  }

  notes.forEach((note, index) => {
    const row = table.insertRow();
    const datetimeCell = row.insertCell();
    const noteCell = row.insertCell();
    const commentCell = row.insertCell(); // New cell for comments

    // Create container for datetime text and delete button
    const datetimeContainer = document.createElement("div");
    datetimeContainer.classList.add("datetime-container");

    // DateTime text
    const datetimeText = document.createElement("span");
    datetimeText.textContent = `${note.datetime} Project: ${note.projectName}`;
    datetimeText.classList.add("datetime-text");

    // `Remove note.` button
    const removeNoteButton = caido.ui.button({
      variant: "primary",
      label: "Delete",
      trailingIcon: "fas fa-trash-can",
      size: "small"
    });

    removeNoteButton.addEventListener("click", async () => {
      const currentNotes = getNotes(caido);
      const updatedNotes = currentNotes.filter((_, i) => i !== index);

      await caido.storage.set({ notes: updatedNotes });
      displayNotes(caido, updatedNotes);
    });

    // Append text and button to container
    datetimeContainer.appendChild(datetimeText);
    datetimeContainer.appendChild(removeNoteButton);

    // Add container to datetime cell
    datetimeCell.appendChild(datetimeContainer);
    datetimeCell.classList.add("datetime-cell");

    // Editable div for note
    const editableNote = document.createElement("div");
    editableNote.contentEditable = "true";
    editableNote.spellcheck = false;
    editableNote.textContent = note.note;
    editableNote.classList.add("text-area-edit");

    editableNote.addEventListener("blur", async () => {
      // Update the note in storage when editing is finished
      const updatedNotes = [...notes];
      updatedNotes[index].note = editableNote.textContent || "";
      await caido.storage.set({ notes: updatedNotes });
      displayNotes(caido, updatedNotes);
    });

    noteCell.appendChild(editableNote);

    // Create textarea for comments
    const commentTextarea = document.createElement("textarea");
    commentTextarea.placeholder = "Add your comments here...";
    commentTextarea.value = note.comment || ""; // Use existing comment if present
    commentTextarea.classList.add("comment-text-area");

    commentTextarea.addEventListener("blur", async () => {
      // Update the comment in storage when editing is finished
      const updatedNotes = [...notes];
      updatedNotes[index].comment = commentTextarea.value;
      await caido.storage.set({ notes: updatedNotes });
      displayNotes(caido, updatedNotes);
    });

    commentCell.appendChild(commentTextarea);
  })
};

export const init = (caido: Caido) => {
  // Retrieve notes from storage
  const notes = getNotes(caido);
  console.log("Current notes:", notes);

  // Populate table with stored notes.
  displayNotes(caido, notes);

  caido.storage.onChange((value) => {
    displayNotes(caido,(value as PluginStorage | undefined)?.notes);
  });

  // Register commands.
  // Commands are registered with a unique identifier and a handler function.
  // The run function is called when the command is executed.
  // These commands can be registered in various places like command palette, context menu, etc.
  caido.commands.register(Commands.clear, {
    name: "Clear Notes in Notebook",
    run: () => clear(caido),
  });

  caido.commands.register(Commands.addNoteMenu, {
    name: "Add Note to Notebook",
    run: () => addNoteMenu(caido),
  });

  // Register command palette items.
  caido.commandPalette.register(Commands.clear);

  caido.commandPalette.register(Commands.addNoteMenu);

  // Register context menu options.
  caido.menu.registerItem({
    type: "Request",
    commandId: Commands.addNoteMenu,
    leadingIcon: "fas fa-book",
  });

  caido.menu.registerItem({
    type: "Response",
    commandId: Commands.addNoteMenu,
    leadingIcon: "fas fa-book",
  });

  // Register page.
  addPage(caido);

  // Register sidebar.
  caido.sidebar.registerItem("Notebook", Page, {
    icon: "fas fa-book",
  });
};
