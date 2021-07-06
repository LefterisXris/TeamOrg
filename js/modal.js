'use strict';

function cancel() {

}

function applyChanges() {

}

/**
 * Resets the modal and prepares it from scratch for the related entry
 * @param entry the entry to prepare the modal for
 */
function prepareModal(entry) {
   resetModal();

   // Set html elements based on input entry and populate with existing data (if any)
   switch (entry) {
      case 'users':
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

         divEntry.appendChild(label);
         divEntry.appendChild(nameInput);

         modalForm.appendChild(divEntry);
         break;
      case 'roles':
         modalTitle.innerText = 'Add new Role';
         modalDescription.innerText = 'Fill in new Role\'s information';

         const divEntry2 = document.createElement('div');
         divEntry2.classList.add('entry');

         const label2 = document.createElement('label');
         label2.setAttribute('for', 'nameR');
         label2.innerText = 'Name:';

         const nameInput2 = document.createElement('input');
         nameInput2.setAttribute('id', 'nameR');
         nameInput2.setAttribute('placeholder', 'Role name...');

         divEntry2.appendChild(label2);
         divEntry2.appendChild(nameInput2);

         modalForm.appendChild(divEntry2);
         break;
      case 'events':
         modalTitle.innerText = 'Add new Event';
         modalDescription.innerText = 'Fill in new Event\'s information';
         break;
      default:
         return;
   }
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
      modal.style.display = 'block';
      prepareModal(selectedComponent);
   });

   // TODO:
   // Action for Editing the selected entry (based on the selected component)
   document.getElementById('edit-entry-btn').addEventListener('click', function openModal1(e) {
      modal.style.display = 'block';
      prepareModal(selectedComponent);
   });

   // Action for Deleting the selected entry (based on the selected component)
   document.getElementById('delete-entry-btn').addEventListener('click', function openModal1(e) {
      modal.style.display = 'block';
      prepareModal(selectedComponent);
   });

}

// Main Execution
const modal = document.getElementById('genericModal');
const modalTitle = document.getElementById('modal-title');
const modalDescription = document.getElementById('modal-description');
const modalForm = document.getElementById('modal-form');
addListeners();
