import React, { lazy } from 'react';
import { CurrentUserContext } from 'shared-lib-usercontext';
import api from '../utils/api.js';

import '../index.css';

const PopupWithForm = lazy(() => import('host/PopupWithForm').catch(() => {
  return { default: () => <div className='error'>Component is not available!</div> };
})
);

function EditProfilePopup({ isOpen, onUpdateUser, onClose }) {
  const [name, setName] = React.useState('');
  const [description, setDescription] = React.useState('');

  const currentUser = React.useContext(CurrentUserContext);

  React.useEffect(() => {
    if (currentUser) {
      setName(currentUser.name);
      setDescription(currentUser.about);
    }
  }, [currentUser]);
 
  function handleUpdateUser(userUpdate) {
    api
      .setUserInfo(userUpdate)
      .then((newUserData) => {
        onUpdateUser(newUserData);
        return onClose();
      })
      .catch((err) => console.log(err));
  }

  function handleNameChange(e) {
    setName(e.target.value);
  }

  function handleDescriptionChange(e) {
    setDescription(e.target.value);
  }

  function handleSubmit(e) {
    e.preventDefault();

    return handleUpdateUser({
      name,
      about: description,
    });
  }

  return (
    <PopupWithForm
      isOpen={isOpen} onSubmit={handleSubmit} onClose={onClose} title="Редактировать профиль" name="edit"
    >
      <label className="popup__label">
        <input type="text" name="userName" id="owner-name"
               className="popup__input popup__input_type_name" placeholder="Имя"
               required minLength="2" maxLength="40" pattern="[a-zA-Zа-яА-Я -]{1,}"
               value={name || ''} onChange={handleNameChange} />
        <span className="popup__error" id="owner-name-error"></span>
      </label>
      <label className="popup__label">
        <input type="text" name="userDescription" id="owner-description"
               className="popup__input popup__input_type_description" placeholder="Занятие"
               required minLength="2" maxLength="200"
               value={description || ''} onChange={handleDescriptionChange} />
        <span className="popup__error" id="owner-description-error"></span>
      </label>
    </PopupWithForm>
  );
}

export default EditProfilePopup;
