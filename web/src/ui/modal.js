export const openModal = (id) => document.getElementById(id)?.classList.remove('hidden');
export const closeModal = (id) => document.getElementById(id)?.classList.add('hidden');
export const isOpen = (id) => !document.getElementById(id)?.classList.contains('hidden');
