'use strict';

function cancel() {
   resetModal();
   selectedEntry = null;
   modal.style.display = 'none';
}

function applyChanges() {
   switch (selectedComponent) {
      case 'users':
         applyUsersChanges();
         break;
      case 'roles':
         applyRolesChanges();
         break;
      case 'events':
         applyEventsChanges();
         break;
   }

   resetModal();
   selectedEntry = null;
   modal.style.display = 'none';
   refreshData();
   persist();
}

function applyUsersChanges() {
   if (selectedEntry) {
      // edit mode
      const user = users.data.find(user => user.id === selectedEntry.id);
      if (!user)
         return;
      user.name = document.getElementById('name').value.trim();
      user.role = document.getElementById('roles-list').value.trim();
      user.pic = document.getElementById('icons-list').value.trim();
   } else {
      // creation mode
      users.data.push({
         id: users.data.length,
         name: document.getElementById('name').value.trim(),
         role: document.getElementById('roles-list').value.trim(),
         pic: document.getElementById('icons-list').value.trim()
      });
   }
}

function applyRolesChanges() {
   if (selectedEntry) {
      // edit mode
      const role = roles.data.find(role => role.id === selectedEntry.id);
      if (!role)
         return;

      users.data.filter(u => u.role === role.name).forEach(u => u.role = null);
      role.name = document.getElementById('name').value.trim();
      role.description = document.getElementById('description').value.trim();
      role.members = document.getElementById('members').value.trim().split(',');
      role.members.forEach(member => {
         const user = users.data.find(u => u.name === member);
         if (user)
            user.role = role.name
      });
   } else {
      // creation mode
      const members = document.getElementById('members').value.trim().split(',');
      roles.data.push({
         id: roles.data.length,
         name: document.getElementById('name').value.trim(),
         description: document.getElementById('description').value.trim(),
         members: members,
      });
      members.forEach(member => users.data.find(u => u.name === member).role = role.name);
   }
}

function applyEventsChanges() {

   if (selectedEntry) {
      // edit mode
      const event = events.data.find(event => event.id === selectedEntry.id);
      if (!event)
         return;

      event.userId = parseInt(document.getElementById('users-list').value.trim());
      event.content = document.getElementById('content').value.trim();
      event.date = new Date(document.getElementById('date').value.trim()).getTime();
      event.readBy = 0;
   } else {
      // creation mode
      events.data.push({
         id: events.data.length,
         userId: parseInt(document.getElementById('users-list').value.trim()),
         content: document.getElementById('content').value.trim(),
         date: new Date(document.getElementById('date').value.trim()).getTime(),
         readBy: 0
      });
   }
}

/**
 * Resets the modal and prepares it from scratch for the related entry
 * @param entry the entry to prepare the modal for
 */
function prepareModal(entry) {
   resetModal();

   switch (entry) {
      case 'users':
         prepareUserModal();
         break;
      case 'roles':
         prepareRoleModal();
         break;
      case 'events':
         prepareEventsModal();
         break;
      default:
         return;
   }
}

function prepareUserModal() {

   // Set html elements based on input entry and populate with existing data (if any)
   modalTitle.innerText = 'Add new User';
   modalDescription.innerText = 'Fill in new User\'s information';

   // Name
   const divEntry = document.createElement('div');
   divEntry.classList.add('entry');

   const label = document.createElement('label');
   label.setAttribute('for', 'name');
   label.innerText = 'Name:';

   const nameInput = document.createElement('input');
   nameInput.setAttribute('id', 'name');
   nameInput.setAttribute('placeholder', 'User name...');

   // set data
   if (selectedEntry) {
      nameInput.value = selectedEntry.name;
   }

   divEntry.appendChild(label);
   divEntry.appendChild(nameInput);

   modalForm.appendChild(divEntry);

   // Role
   const divRoleEntry = document.createElement('div');
   divRoleEntry.classList.add('entry');

   const roleLabel = document.createElement('label');
   roleLabel.setAttribute('for', 'roles-list');
   roleLabel.innerText = 'Role:';

   const rolesSelection = document.createElement('select');
   rolesSelection.setAttribute('id', 'roles-list');
   roles.data.forEach(role => {
      const opt = document.createElement('option');
      opt.setAttribute('value', role.name);
      opt.innerText = role.name;
      rolesSelection.appendChild(opt)
   })

   // set data
   if (selectedEntry) {
      rolesSelection.value = selectedEntry.role;
   }

   divRoleEntry.appendChild(roleLabel);
   divRoleEntry.appendChild(rolesSelection);
   modalForm.appendChild(divRoleEntry);

   // User Icon
   const divIconEntry = document.createElement('div');
   divIconEntry.classList.add('entry');

   const iconLabel = document.createElement('label');
   iconLabel.setAttribute('for', 'icons-list');
   iconLabel.innerText = 'Icon:';

   const iconsSelection = document.createElement('select');
   iconsSelection.setAttribute('id', 'icons-list');
   icons.forEach(icon => {
      const opt = document.createElement('option');
      opt.setAttribute('value', icon.name);
      opt.innerText = icon.name;
      iconsSelection.appendChild(opt)
   })
   if (selectedEntry) {
      iconsSelection.value = selectedEntry.pic;
   }

   divIconEntry.appendChild(iconLabel);
   divIconEntry.appendChild(iconsSelection);
   modalForm.appendChild(divIconEntry);
}

function prepareRoleModal() {

   // Set html elements based on input entry and populate with existing data (if any)
   modalTitle.innerText = 'Add new Role';
   modalDescription.innerText = 'Fill in new Role\'s information';

   // Name
   const divEntry = document.createElement('div');
   divEntry.classList.add('entry');

   const label = document.createElement('label');
   label.setAttribute('for', 'name');
   label.innerText = 'Role Name:';

   const nameInput = document.createElement('input');
   nameInput.setAttribute('id', 'name');
   nameInput.setAttribute('placeholder', 'Role name...');

   if (selectedEntry) {
      nameInput.value = selectedEntry.name;
   }
   divEntry.appendChild(label);
   divEntry.appendChild(nameInput);

   // Description
   const divEntry2 = document.createElement('div');
   divEntry2.classList.add('entry');

   const label2 = document.createElement('label');
   label2.setAttribute('for', 'description');
   label2.innerText = 'Role Description:';

   const nameInput2 = document.createElement('input');
   nameInput2.setAttribute('id', 'description');
   nameInput2.setAttribute('placeholder', 'Description...');

   if (selectedEntry) {
      nameInput2.value = selectedEntry.description;
   }
   divEntry2.appendChild(label2);
   divEntry2.appendChild(nameInput2);

   // Members
   const divEntry3 = document.createElement('div');
   divEntry3.classList.add('entry');

   const label3 = document.createElement('label');
   label3.setAttribute('for', 'members');
   label3.innerText = 'Role Members:';

   const nameInput3 = document.createElement('input');
   nameInput3.setAttribute('id', 'members');
   nameInput3.setAttribute('placeholder', 'Members...');

   if (selectedEntry) {
      nameInput3.value = users.data.filter(user => user.role === selectedEntry.name).map(u => u.name).join(',');
   }
   divEntry3.appendChild(label3);
   divEntry3.appendChild(nameInput3);

   modalForm.appendChild(divEntry);
   modalForm.appendChild(divEntry2);
   modalForm.appendChild(divEntry3);
}

function prepareEventsModal() {

   // Set html elements based on input entry and populate with existing data (if any)
   modalTitle.innerText = 'Add new Event';
   modalDescription.innerText = 'Fill in new Event\'s information';

   const divEntry = document.createElement('div');
   divEntry.classList.add('entry');

   const label = document.createElement('label');
   label.setAttribute('for', 'users-list');
   label.innerText = 'Author:';

   const userSelection = document.createElement('select');
   userSelection.setAttribute('id', 'users-list');
   users.data.forEach(user => {
      const opt = document.createElement('option');
      opt.setAttribute('value', user.id);
      opt.innerText = user.name;
      userSelection.appendChild(opt)
   })

   // set data
   if (selectedEntry) {
      userSelection.value = selectedEntry.userId;
   }

   divEntry.appendChild(label);
   divEntry.appendChild(userSelection);
   modalForm.appendChild(divEntry);

   // Event content
   const contentEntry = document.createElement('div');
   contentEntry.classList.add('entry');

   const contentLabel = document.createElement('label');
   contentLabel.setAttribute('for', 'content');
   contentLabel.innerText = 'Event\'s content:';

   const contentInput = document.createElement('input');
   contentInput.setAttribute('id', 'content');
   contentInput.setAttribute('placeholder', 'Event content (HTML is supported)...');

   if (selectedEntry) {
      contentInput.value = selectedEntry.content;
   }
   contentEntry.appendChild(contentLabel);
   contentEntry.appendChild(contentInput);
   modalForm.appendChild(contentEntry);

   // Date
   const divDateEntry = document.createElement('div');
   divDateEntry.classList.add('entry');

   const dateLabel = document.createElement('label');
   dateLabel.setAttribute('for', 'date');
   dateLabel.innerText = 'Date:';

   const dateInput = document.createElement('input');
   dateInput.setAttribute('id', 'date');
   dateInput.setAttribute('type', 'date');
   dateInput.setAttribute('placeholder', 'Role name...');

   if (selectedEntry) {
      dateInput.value = new Date(selectedEntry.date).toISOString().split('T')[0];
   }
   divDateEntry.appendChild(dateLabel);
   divDateEntry.appendChild(dateInput);
   modalForm.appendChild(divDateEntry);

}

function deleteEntry(component) {
   switch (component) {
      case 'users':
         users.data = users.data.filter(userData => userData.id !== selectedEntry.id);
         break;
      case 'roles':
         roles.data = roles.data.filter(roleData => roleData.id !== selectedEntry.id);
         break;
      case 'events':
         events.data = events.data.filter(roleData => roleData.id !== selectedEntry.id);
         break;
      default:
         return;
   }
   selectedEntry = null;
   refreshData();
   persist();
}

function refreshData(component) {
   switch (component) {
      case 'users':
         popUsers();
         break;
      case 'roles':
         popRoles();
         break;
      case 'events':
         popEvents();
         break;
      default:
         popMain();
         popUsers();
         popRoles();
         popEvents();
         return;
   }
   selectedEntry = null;
}

function resetModal() {
   // Clear title
   modalTitle.innerHTML = '';

   // Clear description
   modalDescription.innerHTML = '';

   // Remove all elements of class entry within modal-form div --> id="modal-form"
   document.querySelectorAll('#modal-form div.entry').forEach(entry => entry.remove());
}

function addListeners() {

   // Modal handling
   window.onclick = function (event) {
      if (event.target === modal) {
         modal.style.display = 'none';
         selectedEntry = null;
      }
   }

   // Closing modal
   document.getElementById('closeModalSpan').addEventListener('click', function closeModal(e) {
      modal.style.display = 'none';
      selectedEntry = null;
   });

   // Action for Adding a new entry (based on the selected component)
   document.getElementById('add-new-entry-btn').addEventListener('click', function openModalNew(e) {
      selectedEntry = null;
      modal.style.display = 'block';
      prepareModal(selectedComponent);
   });

   // Action for Editing the selected entry (based on the selected component)
   document.getElementById('edit-entry-btn').addEventListener('click', function openModalEdit(e) {
      if (selectedEntry && selectedComponent) {
         modal.style.display = 'block';
         prepareModal(selectedComponent);
      }
   });

   // Action for Deleting the selected entry (based on the selected component)
   document.getElementById('delete-entry-btn').addEventListener('click', function deleteActiveEntry(e) {
      if (selectedEntry && selectedComponent)
         deleteEntry(selectedComponent);
   });

   // Action for Refreshing data (based on the selected component)
   document.getElementById('refresh-data-btn').addEventListener('click', function refreshActiveData(e) {
      if (selectedComponent)
         refreshData(selectedComponent);
   });

}

// Main Execution
const modal = document.getElementById('genericModal');
const modalTitle = document.getElementById('modal-title');
const modalDescription = document.getElementById('modal-description');
const modalForm = document.getElementById('modal-form');

addListeners();
