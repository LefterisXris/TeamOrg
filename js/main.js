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
 * @param sortConfig The sort configuration
 * @returns {HTMLTableRowElement} the generated html row (tr element with th data)
 */
function createTableHeaderRow(headerDataArr, sortConfig) {
   const row = document.createElement('tr');
   for (let cellValue of headerDataArr) {
      const cellElem = document.createElement('th');
      cellElem.innerHTML = cellValue.label;
      cellElem.setAttribute('entryKey', cellValue.name);
      if (sortConfig && sortConfig.sortBy === cellValue.name) {
         cellElem.setAttribute('sortMode', sortConfig.sortMode);
      }
      row.appendChild(cellElem);
   }
   return row;
}

/**
 * Creates an HTML table row (tr) containing all the data (td) of the provided array
 * @param rowDataArr The array with the data
 * @returns {HTMLTableRowElement} the generated html row (tr element with td data)
 */
function createTableDataRow(rowDataArr) {
   return createTableRow(rowDataArr, 'td');
}

function toggleSortConfig(config, key) {
   const mode = !config.sort.sortMode ? 'asc' : config.sort.sortMode === 'asc' ? 'desc' : null;
   config.sort.sortBy = key;
   config.sort.sortMode = mode;
}


function sort(objData) {
   if (!objData || !objData.length)
      return;
   const key = objData.config.sort.sortBy;
   const sortMode = objData.config.sort.sortMode;
   const data = objData.data;

   let compareFn;
   switch (objData.config.headers[key].type) {
      case 'numeric':
         compareFn = (a, b) => a[key] - b[key];
         break;
      case 'text':
         compareFn = (a, b) => ('' + a[key]).localeCompare('' + b[key]);
         break;
      default:
         return; // no sort
   }
   data.sort((a, b) => compareFn(a, b));
   if (sortMode === 'desc')
      data.reverse();

   /*if (sortMode === 'asc') {
      data.sort((a,b) => a[key].localeCompare(b[key]));
   } else if (sortMode === 'desc') {
      data.sort((a,b) => b[key].localeCompare(a[key]));
   } else {
      // reset sorting
      data.sort((a,b) => a.id - b.id);
   }*/
}

function db() {
   return JSON.parse(localStorage.getItem(TEAMORG_KEY));
}

function persist() {
   const team = {
      users,
      roles,
      events
   }
   localStorage.setItem(TEAMORG_KEY, JSON.stringify(team));
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
   sort(users);

   // Add headers
   const usersHead = document.createElement('thead');
   const visibleHeaderKeys = Object.keys(users.config.headers).filter(key => users.config.headers[key].visible);
   const visibleEntries = visibleHeaderKeys.map(key => users.config.headers[key]);

   usersHead.appendChild(createTableHeaderRow(visibleEntries, users.config.sort));
   usersTable.appendChild(usersHead);

   // Add listeners for sorting
   usersTable.querySelectorAll('th').forEach(th => th.addEventListener('mouseup', function (e) {
      if (e.button !== 0)
         return;

      const keyToSort = th.getAttribute('entryKey');
      if (keyToSort) {
         toggleSortConfig(users.config, keyToSort)
         popUsers();
      }
   }, false));

   // Add data
   const usersBody = document.createElement('tbody');
   users.data.forEach(userData => {
      const userValuesArray = Object.keys(userData).filter(key => visibleHeaderKeys.includes(key)).map(key => userData[key]);
      userValuesArray.pop();
      const membersWrapper = generateUserWrapper(userData);
      userValuesArray.push(membersWrapper.innerHTML);
      const row = createTableDataRow(userValuesArray);
      row.setAttribute('entryId', userData.id);
      usersBody.appendChild(row);
   });
   usersTable.appendChild(usersBody);
}

function popRoles() {
   clearTable(rolesTable);
   sort(roles);

   // Add headers
   const rolesHead = document.createElement('thead');
   const visibleHeaderKeys = Object.keys(roles.config.headers).filter(key => roles.config.headers[key].visible);
   const visibleEntries = visibleHeaderKeys.map(key => roles.config.headers[key]);
   rolesHead.appendChild(createTableHeaderRow(visibleEntries, roles.config.sort));
   rolesTable.appendChild(rolesHead);

   // Add listeners for sorting
   rolesTable.querySelectorAll('th').forEach(th => th.addEventListener('mouseup', function (e) {
      if (e.button !== 0)
         return;

      const keyToSort = th.getAttribute('entryKey');
      if (keyToSort) {
         toggleSortConfig(roles.config, keyToSort)
         popRoles();
      }
   }, false));

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

   users.data.filter(user => user.role === roleName).forEach(member => {
      const memberDiv = document.createElement('div');
      memberDiv.classList.add('user-with-icon');
      const memberImg = document.createElement('img');
      memberImg.setAttribute('src', member.pic);
      const memberSpan = document.createElement('span');
      memberSpan.innerText = member.name;

      memberDiv.appendChild(memberImg);
      memberDiv.appendChild(memberSpan);

      wrapper.appendChild(memberDiv);
   });

   const container = document.createElement('div');
   container.appendChild(wrapper);
   return container;
}

function generateUserWrapper(user) {
   const wrapper = document.createElement('div');
   wrapper.classList.add('member-icons-wrapper');

   const memberDiv = document.createElement('div');
   memberDiv.classList.add('user-with-icon');
   const memberImg = document.createElement('img');
   memberImg.setAttribute('src', user.pic);
   const memberSpan = document.createElement('span');
   memberSpan.innerText = user.name;

   memberDiv.appendChild(memberImg);
   memberDiv.appendChild(memberSpan);

   wrapper.appendChild(memberDiv);

   const container = document.createElement('div');
   container.appendChild(wrapper);
   return container;
}

function popEvents() {
   // clear the dom element
   while (eventsWrapper.firstChild)
      eventsWrapper.firstChild.remove();

   sort(events);

   events.data.forEach(event => {
      const relatedUser = users.data.find(user => user.id === event.userId);
      if (!relatedUser) {
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
         eventDateElement.innerText = new Date(event.date).toLocaleDateString() + ' ' + new Date(event.date).toLocaleTimeString();

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

function clone(obj) {
   return JSON.parse(JSON.stringify(obj));
}

function sortEventsData() {
   const sortBy = document.getElementById('sortBy').value;
   const sortMode = document.getElementById('sortMode').value;
   if (sortBy && sortBy !== 'none') {
      events.config.sort.sortBy = sortBy;
      events.config.sort.sortMode = sortMode;
      popEvents();
   } else if (sortBy === 'none') {
      events.config.sort.sortBy = 'id';
      events.config.sort.sortMode = 'asc';
      popEvents();
   }
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

}

// Main Execution

// If application hasn't been setup yet, navigate to the setup page
if (db() == null) {
   const baseObj = {
      config: {
         headers: {

         },
         sort: {

         }
      },
      data: []
   }
   const team = {
      users: clone(baseObj),
      roles: clone(baseObj),
      events: clone(baseObj)
   }
   localStorage.setItem(TEAMORG_KEY, JSON.stringify(team));
}

const users = db().users; /*{
   config: {
      headers: {
         id: {
            label: 'id',
            name: 'id',
            type: 'numeric',
            visible: false
         },
         name: {
            label: 'Name',
            name: 'name',
            type: 'text',
            visible: true
         },
         role: {
            label: 'Role',
            name: 'role',
            type: 'text',
            visible: true
         },
         pic: {
            label: 'User Pic',
            name: 'pic',
            type: 'image',
            visible: true
         },
      },
      sort: {
         sortBy: 'id',
         sortMode: 'asc'
      }
   },
   data: [
      {
         id: 0,
         name: 'Lefteris',
         role: 'Admin',
         pic: 'img/user-male-1.svg',
      },
      {
         id: 1,
         name: 'Nikos',
         role: 'Player',
         pic: 'img/user-male-2.svg',
      },
      {
         id: 2,
         name: 'Xristina',
         role: 'Player',
         pic: 'img/user-female-1.svg',
      }
   ]
}*/

const roles = db().roles; /*{
   config: {
      headers: {
         id: {
            label: 'id',
            name: 'id',
            type: 'numeric',
            visible: false
         },
         name: {
            label: 'Name',
            name: 'name',
            type: 'text',
            visible: true
         },
         description: {
            label: 'Description',
            name: 'description',
            type: 'text',
            visible: true
         },
         members: {
            label: 'Members',
            name: 'members',
            type: 'array',
            visible: true
         },
      },
      sort: {
         sortBy: 'id',
         sortMode: 'asc'
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
}*/

const events = db().events; /*{
   config: {
      headers: {
         id: {
            label: 'id',
            name: 'id',
            type: 'numeric',
            visible: false
         },
         userId: {
            label: 'User',
            name: 'userId',
            type: 'numeric',
            visible: false
         },
         date: {
            label: 'Date',
            name: 'date',
            type: 'numeric',
            visible: true
         },
         readBy: {
            label: 'Read By',
            name: 'readBy',
            type: 'numeric',
            visible: true
         }
      },
      sort: {
         sortBy: 'id',
         sortMode: 'asc'
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
}*/

const icons = [
   {id: 0, name: 'img/user.svg'},
   {id: 1, name: 'img/user-male-1.svg'},
   {id: 2, name: 'img/user-male-2.svg'},
   {id: 3, name: 'img/user-male-3.svg'},
   {id: 4, name: 'img/user-male-4.svg'},
   {id: 5, name: 'img/user-male-5.svg'},
   {id: 6, name: 'img/user-female-1.svg'},
   {id: 7, name: 'img/user-female-2.svg'},
   {id: 8, name: 'img/user-female-3.svg'},
   {id: 9, name: 'img/user-artist.svg'},
   {id: 10, name: 'img/user-boss.svg'},
];

const usersTable = document.getElementById('users-table');
const rolesTable = document.getElementById('roles-table');
const eventsWrapper = document.getElementById('events-wrapper');
const eventsItemTemplate = document.getElementById('event-item-template');


popUsers();
popRoles();
popEvents();
const interval = setInterval(function increaseReadBy() {
   // every 10 seconds, increase the 'read by' indication
   events.data.forEach(event => {
      const step = Math.floor(Math.random() * (10 - 1 + 1) + 1);
      event.readBy += step;
      if (event.readBy > 1000)
         event.readBy = 0;
   });
   popEvents();
}, 10000);

registerListeners();
