'use strict';

/* **************
*** Constants ***
*****************/

const TEAMORG_KEY = 'teamorg';

/* ********************
*** Service Workers ***
***********************/

if ('serviceWorker' in navigator) {
   navigator.serviceWorker.register('/sw.js').catch(function (error) {
      console.log('Registration failed with ' + error);
   });
}

/* ****************
*** Handle A2HS ***
*******************/

// Handle A2HS
let deferredPrompt;
const installBtn = document.getElementById('install');

/* ************
*** Generic ***
***************/

/**
 * Creates an HTML table row (tr) containing all the data of the provided array.
 * The generated row may contain either table-header (th) or table-data (td) elements
 * @param dataArr The array with the data
 * @param rowElement tr | td
 * @returns {HTMLTableRowElement} the generated html row (tr element)
 */
function createTableRow(dataArr, rowElement) {
   const row = document.createElement('tr');
   for (let cellValue of dataArr) {
      const cellElem = document.createElement(rowElement);
      cellElem.innerHTML = cellValue;
      row.appendChild(cellElem);
   }
   return row;
}

/**
 * Creates an HTML table row (tr) containing all the header data (th) of the provided array
 * @param headerDataArr The array with the header data
 * @returns {HTMLTableRowElement} the generated html row (tr element with th data)
 */
function createTableHeaderRow(headerDataArr) {
   const headerRow = createTableRow(headerDataArr[0], 'th');

   // Add the context menu listener for show/hide columns functionality
   headerRow.addEventListener('contextmenu', function showHeaderContextMenu(e) {
      const table = headerRow.closest('table');
      generateContextMenu(headerDataArr, e.clientX, e.clientY, table.id);
      e.preventDefault();
   }, false);

   return headerRow;
}

/**
 * Creates an HTML table row (tr) containing all the data (td) of the provided array
 * @param rowDataArr The array with the data
 * @returns {HTMLTableRowElement} the generated html row (tr element with td data)
 */
function createTableDataRow(rowDataArr) {
   return createTableRow(rowDataArr, 'td');
}


// Show Hide functionality

/**
 * Hides a specific column from the provided table
 * @param tableId The id of the table that the column belongs to
 * @param columnIndex the index of column in the table
 */
function hideColumn(tableId, columnIndex) {
   columnIndex++; // column indexing starts at 0
   const nodes = document.querySelectorAll(`#${tableId} tr td:nth-child(${columnIndex}), #${tableId} tr th:nth-child(${columnIndex})`);
   nodes.forEach(node => node.setAttribute('hidden', 'true'));
   // console.log(`Hiding column '${columnIndex}' from table '${tableId}'`);
}

/**
 * Shows a specific column from the provided table
 * @param tableId The id of the table that the column belongs to
 * @param columnIndex the index of column in the table
 */
function showColumn(tableId, columnIndex) {
   columnIndex++;
   const nodes = document.querySelectorAll(`#${tableId} tr td:nth-child(${columnIndex}), #${tableId} tr th:nth-child(${columnIndex})`);
   nodes.forEach(node => node.removeAttribute('hidden'));
   // console.log(`Showing column '${columnIndex}' from table '${tableId}'`);
}

/**
 * Clears the data and hides the contextMenu
 */
function clearCtxMenu() {
   const ctxMenu = document.getElementById("ctxMenu");
   if (ctxMenu) {
      setTimeout(function hideContextMenu(e) {
         ctxMenu.innerHTML = '';
         ctxMenu.style.visibility = 'hidden';
      }, 50);
   }
}

function isCtxMenuOpen() {
   return document.getElementById('ctxMenu').innerHTML !== '';
}

/**
 * Populates the contextMenu with the provided data
 */
function generateContextMenu(headerArray, x, y, tableId) {
   const ctxMenu = document.getElementById('ctxMenu');
   ctxMenu.innerHTML = '';

   for (let i = 0; i < headerArray[0].length; i++) {
      const headerItem = headerArray[0][i];

      const contextRow = document.createElement('div');

      const chBox = document.createElement('input');
      chBox.setAttribute('type', 'checkbox');
      chBox.setAttribute('id', 'chBox-' + headerItem);
      chBox.setAttribute('colIndex', '' + i);
      if (headerArray[1][i])
         chBox.setAttribute('checked', 'true');
      else
         chBox.removeAttribute('checked');

      const item = document.createElement('label');
      item.setAttribute('for', 'chBox-' + headerItem);
      item.innerHTML = headerItem;

      contextRow.appendChild(chBox);
      contextRow.appendChild(item);

      // CheckBox listener
      chBox.addEventListener('change', function onCheckBoxChange(e) {
         if (this.checked) {
            headerArray[1][i] = true;
            showColumn(tableId, this.getAttribute('colIndex'));
         } else {
            headerArray[1][i] = false;
            hideColumn(tableId, this.getAttribute('colIndex'));
         }

         // if all columns are hidden, hide the table and enable the 'reset' button
         if (headerArray[1].every(v => v === false)) {
            const table = document.getElementById(tableId);
            table.setAttribute('hidden', 'true');

            const resetBtn = document.createElement('button');
            resetBtn.innerHTML = 'Reset table columns';
            resetBtn.setAttribute('class', 'resetButton');
            resetBtn.addEventListener('click', function resetColumns(e) {
               table.removeAttribute('hidden');
               document.querySelectorAll(`#${tableId} th`).forEach(th => {
                  showColumn(tableId, th.cellIndex);
               });
               for (let j = 0; j < headerArray[1].length; j++) {
                  headerArray[1][j] = true;
               }
               resetBtn.remove();
            }, false);

            table.parentElement.appendChild(resetBtn);
            clearCtxMenu();
         }
      }, false);

      ctxMenu.appendChild(contextRow);
   }

   const menuStyle = ctxMenu.style;
   menuStyle.top = y + 'px';
   menuStyle.left = x + 'px';
   menuStyle.visibility = 'visible';
}

function sortData(tableId, dataArr, headerArr, th) {

   const desc = th.getAttribute('sortBy') === 'desc';
   const colIndex = th.cellIndex;

   let compareFn;
   switch (headerArr[2][colIndex]) {
      case 'numeric':
         compareFn = (a, b) => a[colIndex] - b[colIndex];
         break;
      case 'text':
         compareFn = (a, b) => ('' + a[colIndex]).localeCompare('' + b[colIndex]);
         break;
      case 'html':
         compareFn = (a, b) => {
            const tmpElem1 = document.createElement('div');
            tmpElem1.innerHTML = a[colIndex];
            const tmpElem2 = document.createElement('div');
            tmpElem2.innerHTML = b[colIndex];
            return tmpElem1.querySelector('div:first-child').innerText - tmpElem2.querySelector('div:first-child').innerText;
         }
         break;
      case 'none':
      case '':
         return; // no sort
   }
   console.log(`Sorting table '${tableId}' on column '${th.innerText}' in '${desc ? 'desc' : 'asc'}' mode comparing ${headerArr[2][colIndex]}`);
   dataArr.sort((a, b) => compareFn(a, b));
   if (desc)
      dataArr.reverse();
}

function db() {
   return JSON.parse(localStorage.getItem(TEAMORG_KEY));
}

// the default css configuration for the main components of the app
const displayCache = {
   home: 'flex',
   users: 'block',
   roles: 'block',
   events: 'block'
}

let selectedComponent = 'home';
let selectedEntry = null;

/**
 * Toggles the visibility of the main components of the app
 * @param selectedId The component to be visible
 */
function updateVisibility(selectedId) {
   resetMainComponents();
   selectedComponent = selectedId;
   const element = document.getElementById(selectedId);
   element.style.display = displayCache[selectedId];
   const elementRef = document.getElementById(selectedId + 'Ref');
   elementRef.classList.add('selected');

   // actions visibility
   const actions = document.getElementById('actions');
   actions.style.display = document.getElementById('homeRef').classList.contains('selected') ? 'none' : 'flex';
}

/**
 * Makes all main components invisible
 */
function resetMainComponents() {
   let ids = ['home', 'users', 'roles', 'events'];
   ids.forEach(id => {
      const element = document.getElementById(id);
      element.style.display = 'none';
      const elementRef = document.getElementById(id + 'Ref');
      elementRef.classList.remove('selected');
   });
}

function popUsers() {
   clearTable(usersTable);

   // Add headers
   const usersHead = document.createElement('thead');
   const visibleHeaderKeys = Object.keys(users.config.headers).filter(key => users.config.headers[key].visible);
   const visibleHeaderLabels = visibleHeaderKeys.map(key => users.config.headers[key].label);
   usersHead.appendChild(createTableRow(visibleHeaderLabels, 'th'));
   usersTable.appendChild(usersHead);

   // Add data
   const usersBody = document.createElement('tbody');
   users.data.forEach(userData => {
      const userValuesArray = Object.keys(userData).filter(key => visibleHeaderKeys.includes(key)).map(key => userData[key]);
      const row = createTableDataRow(userValuesArray)
      row.setAttribute('entryId', userData.id);
      usersBody.appendChild(row);
   });
   usersTable.appendChild(usersBody);
}

function popRoles() {
   clearTable(rolesTable);

   // Add headers
   const rolesHead = document.createElement('thead');
   const visibleHeaderKeys = Object.keys(roles.config.headers).filter(key => roles.config.headers[key].visible);
   const visibleHeaderLabels = visibleHeaderKeys.map(key => roles.config.headers[key].label);
   rolesHead.appendChild(createTableRow(visibleHeaderLabels, 'th'));
   rolesTable.appendChild(rolesHead);

   // Add data
   const rolesBody = document.createElement('tbody');
   roles.data.forEach(roleData => {
      const roleValuesArray = Object.keys(roleData).filter(key => visibleHeaderKeys.includes(key)).map(key => roleData[key]);
      // preprocess members column

      const membersWrapper = generateMembersWrapper(roleValuesArray.pop(), roleData.name);
      roleValuesArray.push(membersWrapper.innerHTML);

      const row = createTableDataRow(roleValuesArray)
      row.setAttribute('entryId', roleData.id);
      rolesBody.appendChild(row);
   });
   rolesTable.appendChild(rolesBody);
}

function generateMembersWrapper(membersData, roleName) {
   const wrapper = document.createElement('div');
   wrapper.classList.add('member-icons-wrapper');

   users.data.filter(user => user.role === roleName).map(u => u.name).forEach(member => {
      const memberDiv = document.createElement('div');
      memberDiv.classList.add('user-with-icon');
      const memberImg = document.createElement('img');
      memberImg.setAttribute('src', 'img/user.svg');
      const memberSpan = document.createElement('span');
      memberSpan.innerText = member;

      memberDiv.appendChild(memberImg);
      memberDiv.appendChild(memberSpan);

      wrapper.appendChild(memberDiv);
   });

   const container = document.createElement('div');
   container.appendChild(wrapper);
   return container;
}

function popEvents() {
   // clear the dom element
   while(eventsWrapper.firstChild)
      eventsWrapper.firstChild.remove();

   events.data.forEach(event => {
      const relatedUser = users.data.find(user => user.id === event.userId);
      if (!relatedUser){
         console.error('Could not find user with id ' + event.userId);
         return;
      }

      const eventItem = eventsItemTemplate.cloneNode(true);
      eventItem.removeAttribute('id');

      // inject user's info
      if (relatedUser.pic) {
         const userImgElement = eventItem.querySelector('img');
         if (userImgElement) {
            userImgElement.setAttribute('src', relatedUser.pic);
         }
      }

      const userNameElement = eventItem.querySelector('.user-wrapper span');
      if (userNameElement)
         userNameElement.innerText = relatedUser.name;

      const eventContent = eventItem.querySelector('.event-item-actual-content');
      if (eventContent)
         eventContent.innerHTML = event.content;

      const eventDateElement = eventItem.querySelector('.event-item-date');
      if (eventDateElement)
         eventDateElement.innerText = new Date(event.date).toLocaleDateString() + ' ' + new Date(event.date).toLocaleTimeString() ;

      const readByElem = eventItem.querySelector('.readBy');
      if (readByElem)
         readByElem.innerText = 'Read by ' + event.readBy;

      // TODO: Likes/Reactions etc

      eventItem.setAttribute('entryId', event.id);
      eventsWrapper.appendChild(eventItem);
   });
}

/**
 * Clears all the content of the given table
 */
function clearTable(table) {
   const head = table.querySelector('thead');
   if (head)
      head.remove();

   const body = table.querySelector('tbody');
   if (body)
      body.remove();
}

function registerListeners() {
   // PWA related
   window.addEventListener('beforeinstallprompt', function (ev) {
      // Prevent some older browsers from popping the install prompt
      ev.preventDefault();
      // Stash the event so it can be triggered later.
      deferredPrompt = ev;
      // Update UI to notify the user they can add to home screen
      installBtn.style.visibility = 'visible';

      installBtn.addEventListener('click', function () {
         // Show the prompt
         deferredPrompt.prompt();
         // Wait for the user to respond to the prompt
         deferredPrompt.userChoice.then(function (choiceResult) {
            if (choiceResult.outcome === 'accepted') {
               // Don't need it any more
               installBtn.style.visibility = 'hidden';
               deferredPrompt = null;
               console.log('User accepted the A2HS prompt');
            } else {
               console.log('User dismissed the A2HS prompt');
            }
         });
      });
   });

   // PWA related
   window.addEventListener('appinstalled', function () {
      installBtn.style.visibility = 'hidden';
      deferredPrompt = null;
      console.log('PWA was installed');
   });

   document.getElementById('users-table').addEventListener('click', function editTableData(e) {
      if (e.target && e.target instanceof HTMLElement) {
         const target = e.target;
         const row = target.closest('tr');
         if (row && row.getAttribute('entryId')) {
            const entryId = row.getAttribute('entryId');
            selectedEntry = users.data.find(user => user.id === Number.parseInt(entryId));
         }
      }
   });

   document.getElementById('roles-table').addEventListener('click', function editRoleTableData(e) {
      if (e.target && e.target instanceof HTMLElement) {
         const target = e.target;
         const row = target.closest('tr');
         if (row && row.getAttribute('entryId')) {
            const entryId = row.getAttribute('entryId');
            selectedEntry = roles.data.find(role => role.id === Number.parseInt(entryId));
         }
      }
   });

   document.getElementById('events-wrapper').addEventListener('click', function editEventsData(e) {
      if (e.target && e.target instanceof HTMLElement) {
         const target = e.target;
         const row = target.closest('.event-item');
         if (row && row.getAttribute('entryId')) {
            const entryId = row.getAttribute('entryId');
            selectedEntry = events.data.find(event => event.id === Number.parseInt(entryId));

            for (let child of row.parentElement.children) {
               child.classList.remove('selected');
            }
            row.classList.add('selected');
         }
      }
   });

   const actions = document.getElementById('actions');
   actions.style.display = document.getElementById('homeRef').classList.contains('selected') ? 'none' : 'flex';

   document.getElementById('clear-data').addEventListener('click', function clearApplicationData(e) {
      if (confirm('All data will be deleted. Are you sure? Action can not be reverted')) {
         localStorage.clear();
         location.reload();
      }
   });

   document.getElementById('load-data').addEventListener('click', function loadDataFromFile(e) {
      if (confirm('To load data, the current data will be deleted. Are you sure? Action can not be reverted')) {
         const input = document.createElement('input');
         input.setAttribute("type", "file");
         input.setAttribute("accept", ".json");
         input.addEventListener('change', async function loadFile() {
            let file = this.files.item(0)
            const txt = await file.text();
            localStorage.setItem(TEAMORG_KEY, txt);
            location.reload();
         });
         input.click();
      }
   });

   document.getElementById('edit-data').addEventListener('click', function editBasicData(e) {
      // Edit color, logo, team name
   });

   document.addEventListener('click', function disposeContextMenuOnClick(e) {
      if (e.button !== 0 || e.target.closest('#ctxMenu') != null)
         return; // context menu is clicked, thus no action is required
      clearCtxMenu();
   }, false);

   document.addEventListener('keydown', function disposeContextMenuOnEsc(e) {
      if (e.code === 'Escape') {
         clearCtxMenu();
         document.getElementById('tournamentFilterModal').style.display = 'none';
         document.getElementById('evolutionFilterModal').style.display = 'none';
      }
   }, false);

}

// Main Execution

// If application hasn't been setup yet, navigate to the setup page
if (db() == null) {
   window.onload = function () {
      // window.location.href = "setup.html";
   }
}

const users = {
   config: {
      headers: {
         id: {
            label: 'id',
            type: 'numeric',
            visible: false
         },
         name: {
            label: 'Name',
            type: 'text',
            visible: true
         },
         role: {
            label: 'Role',
            type: 'text',
            visible: true
         },
         pic: {
            label: 'User Pic',
            type: 'image',
            visible: true
         },
      }
   },
   data: [
      {
         id: 0,
         name: 'Lefteris',
         role: 'Admin',
         pic: 'img/user.svg',
      },
      {
         id: 1,
         name: 'Cristiano',
         role: 'Player',
         pic: 'img/teamorg.png',
      }
   ]
}

const roles = {
   config: {
      headers: {
         id: {
            label: 'id',
            type: 'numeric',
            visible: false
         },
         name: {
            label: 'Name',
            type: 'text',
            visible: true
         },
         description: {
            label: 'Description',
            type: 'text',
            visible: true
         },
         members: {
            label: 'Members',
            type: 'array',
            visible: true
         },
      }
   },
   data: [
      {
         id: 0,
         name: 'Admin',
         description: 'Administrator role',
         members: []
      },
      {
         id: 1,
         name: 'Player',
         description: 'Simple users role',
         members: []
      }
   ]
}

const events = {
   config: {
      headers: {
         id: {
            label: 'id',
            type: 'numeric',
            visible: false
         },
         userId: {
            label: 'User',
            type: 'numeric',
            visible: false
         },
         date: {
            label: 'Date',
            type: 'numeric',
            visible: true
         },
         readBy: {
            label: 'Read By',
            type: 'numeric',
            visible: true
         }
      }
   },
   data: [
      {
         id: 0,
         userId: 0,
         content: '@Coach, I won\'t make it to the training today',
         date: Date.now(),
         readBy: 0,
      },
      {
         id: 1,
         userId: 1,
         content: 'Next match vs Napoli on Sunday: 21:45<br>#matchday, #away-game, #derby',
         date: Date.now(),
         readBy: 0,
      }
   ]
}

const icons = [
   { id: 0, name: 'img/user.svg' },
   { id: 1, name: 'img/user.svg' },
   { id: 2, name: 'img/user.svg' },
   { id: 3, name: 'img/user.svg' },
   { id: 4, name: 'img/user.svg' },
];

const usersTable = document.getElementById('users-table');
const rolesTable = document.getElementById('roles-table');
const eventsWrapper = document.getElementById('events-wrapper');
const eventsItemTemplate = document.getElementById('event-item-template');




popUsers();
popRoles();
popEvents();
const interval = setInterval(function increaseReadBy() {
   // every 30 seconds, increase the 'read by' indication
   events.data.forEach(event => {
      const step = Math.floor(Math.random() * (10-1+1) + 1);
      event.readBy += step;
      if (event.readBy > 1000)
         event.readBy = 0;
   });
   popEvents();
}, 30000);

registerListeners();
