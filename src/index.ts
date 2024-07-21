import type { Caido } from "@caido/sdk-frontend";

import type { PluginStorage } from "./types";

const Page = "/notebook";
const Commands = {
  clear: "notebook.clear",
  addNoteMenu: "notebook.addNoteMenu"
};

// Get notes from storage.
const getNotes = (caido: Caido): PluginStorage["notes"] => {
  const storage = caido.storage.get() as PluginStorage | undefined;
  if (storage && storage.notes) {
    console.log("Retrieved notes from storage: ", storage.notes);
    return [...storage.notes];
  }
  return [];
}

// Add note to storage.
const addNoteStorage = (caido: Caido, datetime: string, note: string, projectName?: string) => {
  let storage = caido.storage.get() as PluginStorage | undefined;
  if (!storage) {
    storage = { notes: [] };
  }
  
  const updatedNotes = [...storage.notes, { datetime, note, projectName }];
  caido.storage.set({ ...storage, notes: updatedNotes });

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
}

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
      const projectName = projectData.name || 'No Project Selected';
      const datetime = new Date().toLocaleString();
      const row = table.insertRow();
      const datetimeCell = row.insertCell();
      const inputCell = row.insertCell();

      datetimeCell.textContent = `${datetime} Project: ${projectName}`;
      datetimeCell.classList.add('datetime-cell');
      inputCell.textContent = currentSelect;

      // Add the note to storage.
      addNoteStorage(caido, datetime, currentSelect, projectName);
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
  2. Click the <span class="light-brown">>_ Commands</span> button located at the topbar in the upper-right corner. Search/Select <span class="light-brown">Add Note to Notebook</span>. Supply input in the prompt and click <span class="light-light-brown">OK</span>.<br>
  3. Highlight select text within a request/response pane and open the context menu by right-clicking. Hover over the <span class="light-brown">Plugins</span> item and select <span class="light-light-brown">Add Note to Notebook</span>.<br>
  4. <span class="light-brown">CTRL+C</span> and <span class="light-brown">CTRL+V</span> within request and response panes is available as well but <span class="red">ensure to deselect the text and unfocus the pane to avoid needing to restart the Caido application.</span><br>
  <br>
  <span class="bold-brown">To clear all notes:</span><br>
  <span class="bold-red">***This will reset the notes in storage. This action cannot be undone.***</span><br>
  1. Click the <span class="light-brown">>_ Commands</span> button located at the topbar in the upper-right corner. Search/Select <span class="light-brown">Clear Notes in Notebook</span>.`
  instructions.className = "center";

  details.appendChild(instructions);

  // Input textarea.
  const textarea = document.createElement("textarea");
  textarea.placeholder = "Enter note here...";
  textarea.classList.add("text-area");

  // `Add note.` button.
  const addNoteButton = caido.ui.button({
    variant: "primary",
    label: "Add Note"
  });

  addNoteButton.addEventListener("click", async () => {
    const datetime = new Date().toLocaleString();
    let inputValue = textarea.value;

    if (inputValue) {
      const project = await caido.graphql.currentProject();
      const projectData = project?.currentProject;
      const projectName = projectData?.name || 'No Project Selected';
      const row = table.insertRow();
      const datetimeCell = row.insertCell();
      const inputCell = row.insertCell();

      datetimeCell.textContent = `${datetime} Project: ${projectName}`;
      datetimeCell.classList.add('datetime-cell');
      inputCell.textContent = inputValue;

      // Add the note to storage.
      addNoteStorage(caido, datetime, inputValue, projectName);

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
  buttonContainer.classList.add("button-container")

  const footerContainer = document.createElement("div");
  footerContainer.appendChild(textarea);
  footerContainer.appendChild(buttonContainer);


  // Card elements.
  const card = caido.ui.card({
    header: headerContainer,
    body: tableContainer,
    footer: footerContainer
  });

  // Create plugin page in left tab menu.
  caido.navigation.addPage(Page, {
    body: card,
  });
};

export const init = (caido: Caido) => {
  // Retrieve notes from storage
  const notes = getNotes(caido);
  console.log("Current notes:", notes);

  // Populate table with stored notes.
  if (notes && notes.length > 0) {
    notes.forEach((note) => {
      const row = table.insertRow();;
      const datetimeCell = row.insertCell();
      const noteCell = row.insertCell();
          
      datetimeCell.textContent = `${note.datetime} Project: ${note.projectName}`;
      datetimeCell.classList.add('datetime-cell');
      noteCell.textContent = note.note;
      });
    }

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
    leadingIcon: "fas fa-book"
  });

  caido.menu.registerItem({
    type: "Response",
    commandId: Commands.addNoteMenu,
    leadingIcon: "fas fa-book"
  });

  // Register page.
  addPage(caido);

  // Register sidebar.
  caido.sidebar.registerItem("Notebook", Page, {
    icon: "fas fa-book",
  });
};