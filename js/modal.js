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
}

function applyUsersChanges() {
   if (selectedEntry) {
      // edit mode
      const user = users.data.find(user => user.id === selectedEntry.id);
      if (!user)
         return;
      user.name = document.getElementById('name').value.trim();
   } else {
      // creation mode
      users.data.push({
         id: users.data.length,
         name: document.getElementById('name').value.trim(),
         role: 'User',
         pic: 'myPic'
      });
   }
   popUsers();
}

function applyRolesChanges() {
   if (selectedEntry) {
      // edit mode
      const role = roles.data.find(role => role.id === selectedEntry.id);
      if (!role)
         return;
      role.name = document.getElementById('name').value.trim();
      role.description = document.getElementById('description').value.trim();
      role.members = document.getElementById('members').value.trim().split(',');
   } else {
      // creation mode
      roles.data.push({
         id: roles.data.length,
         name: document.getElementById('name').value.trim(),
         description: document.getElementById('description').value.trim(),
         members: document.getElementById('members').value.trim().split(','),
      });
   }
   popRoles();
}

function applyEventsChanges() {
   if (selectedEntry) {
      // edit mode
      const user = users.data.find(user => user.id === selectedEntry.id);
      if (!user)
         return;
      user.name = document.getElementById('name').value.trim();
   } else {
      // creation mode
      users.data.push({
         id: users.data.length,
         name: document.getElementById('name').value.trim(),
         role: 'User',
         pic: 'myPic'
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
   nameInput2.setAttribute('placeholder', 'Role description...');

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
      nameInput3.value = selectedEntry.members.join(',');
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
}

function deleteEntry(component) {
   switch (component) {
      case 'users':
         users.data = users.data.filter(userData => userData.id !== selectedEntry.id);
         popUsers();
         break;
      case 'roles':
         roles.data = roles.data.filter(roleData => roleData.id !== selectedEntry.id);
         popRoles();
         break;
      case 'events':
         break;
      default:
         return;
   }
   if (selectedEntry) {

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
   window.onclick = function(event) {
      if (event.target === modal) {
         modal.style.display = 'none';
      }
   }

   // Closing modal
   document.getElementById('closeModalSpan').addEventListener('click', function closeModal(e) {
      modal.style.display = 'none';
   });

   // Action for Adding a new entry (based on the selected component)
   document.getElementById('add-new-entry-btn').addEventListener('click', function openModal1(e) {
      selectedEntry = null;
      modal.style.display = 'block';
      prepareModal(selectedComponent);
   });

   // Action for Editing the selected entry (based on the selected component)
   document.getElementById('edit-entry-btn').addEventListener('click', function openModal1(e) {
      modal.style.display = 'block';
      prepareModal(selectedComponent);
   });

   // Action for Deleting the selected entry (based on the selected component)
   document.getElementById('delete-entry-btn').addEventListener('click', function openModal1(e) {
      if (selectedEntry && selectedComponent)
         deleteEntry(selectedComponent);
   });

}

// Main Execution
const modal = document.getElementById('genericModal');
const modalTitle = document.getElementById('modal-title');
const modalDescription = document.getElementById('modal-description');
const modalForm = document.getElementById('modal-form');

addListeners();
