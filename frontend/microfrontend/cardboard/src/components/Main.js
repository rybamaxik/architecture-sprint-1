import React, { lazy, Suspense } from 'react';
import Card from './Card';
import ImagePopup from './ImagePopup';
import { CurrentUserContext } from "shared-lib-usercontext";
import api from "../utils/api";

import '../index.css';

const AddPlacePopup = lazy(() => import('upload/AddPlacePopup').catch(() => {
  return { default: () => <div className='error'>AddPlacePopup component is not available!</div> };
})
);
 
const EditAvatarPopup = lazy(() => import('profile/EditAvatarPopup').catch(() => {
  return { default: () => <div className='error'>EditAvatarPopup component is not available!</div> };
})
);

const EditProfilePopup = lazy(() => import('profile/EditProfilePopup').catch(() => {
  return { default: () => <div className='error'>EditProfilePopup component is not available!</div> };
})
);

const ProfileHeader = lazy(() => import('profile/ProfileHeader').catch(() => {
  return { default: () => <div className='error'>ProfileHeader component is not available!</div> };
})
);

function Main({}) {
  const [isEditProfilePopupOpen, setIsEditProfilePopupOpen] =
    React.useState(false);
  const [isAddPlacePopupOpen, setIsAddPlacePopupOpen] = React.useState(false);
  const [isEditAvatarPopupOpen, setIsEditAvatarPopupOpen] =
    React.useState(false);

  // В корневом компоненте Main создана стейт-переменная currentUser. Она используется в качестве значения для провайдера контекста.
  const [currentUser, setCurrentUser] = React.useState({});
  //const currentUser = React.useContext(CurrentUserContext);

  const [selectedCard, setSelectedCard] = React.useState(null);
  const [cards, setCards] = React.useState([]);

  // Запрос к API за информацией о пользователе и массиве карточек выполняется единожды, при монтировании.
  React.useEffect(() => {
    api.getUserInfo()
      .then((userData) => {
        setCurrentUser(userData);
      })
      .catch((err) => console.log(err));
  }, []);
  
  // Запрос к API за информацией о массиве карточек выполняется единожды, при монтировании.
  React.useEffect(() => {
    api
      .getCardList()
      .then((cardData) => {
        setCards(cardData);
      })
      .catch((err) => console.log(err));
  }, []);
  
  function handleCardClick(card) {
    setSelectedCard(card);
  }

  function handleCardLike(card) {
    const isLiked = card.likes.some((i) => i._id === currentUser._id);
    api
      .changeLikeCardStatus(card._id, !isLiked)
      .then((newCard) => {
        setCards((cards) =>
          cards.map((c) => (c._id === card._id ? newCard : c))
        );
      })
      .catch((err) => console.log(err));
  }

  function handleCardDelete(card) {
    api
      .removeCard(card._id)
      .then(() => {
        setCards((cards) => cards.filter((c) => c._id !== card._id));
      })
      .catch((err) => console.log(err));
  }

  function handleCardClose(card) {
    setSelectedCard(null);
  }

  function handleEditProfileClick() {
    setIsEditProfilePopupOpen(true);
  }

  function handleAddPlaceClick() {
    setIsAddPlacePopupOpen(true);
  }

  function handleEditAvatarClick() {
    setIsEditAvatarPopupOpen(true);
  }

  function handleUpdateAvatar(newUserData)
  {
    setCurrentUser(newUserData);
  }

  function handleUpdateUser(newUserData) {
    setCurrentUser(newUserData);
  }

  function onCloseEditAvatarPopup() {
    setIsEditAvatarPopupOpen(false);
  }

  function onCloseEditProfilePopup() {
    setIsEditProfilePopupOpen(false);
  }

  function onCloseAddPlacePopup() {
    setIsAddPlacePopupOpen(false);
  }

  function handleNewCard(newcard) {
    setCards([newcard, ...cards]);
  }

  return (
    // В компонент Main внедрён контекст через CurrentUserContext.Provider
    <CurrentUserContext.Provider value={currentUser}>
      <div className="page__content">
        <main className="content">
          <Suspense>
            <ProfileHeader onEditAvatar={handleEditAvatarClick} onEditProfile={handleEditProfileClick} 
                           onAddPlace={handleAddPlaceClick} />
          </Suspense>
          <section className="places page__section">
            <ul className="places__list">
              {cards.map((card) => (
                <Card
                  key={card._id}
                  card={card}
                  onCardClick={handleCardClick}
                  onCardLike={handleCardLike}
                  onCardDelete={handleCardDelete}
                />
              ))}
            </ul>
          </section>
        </main>
        <ImagePopup card={selectedCard} onClose={handleCardClose} />
        <Suspense>
          <EditAvatarPopup
            isOpen={isEditAvatarPopupOpen}
            onUpdateAvatar={handleUpdateAvatar}
            onClose={onCloseEditAvatarPopup} />
        </Suspense>
        <Suspense>
          <EditProfilePopup
            isOpen={isEditProfilePopupOpen}
            onUpdateUser={handleUpdateUser}
            onClose={onCloseEditProfilePopup} />
        </Suspense>
        <Suspense>
          <AddPlacePopup
            isOpen={isAddPlacePopupOpen}
            onNewCard={handleNewCard}
            onClose={onCloseAddPlacePopup} />
        </Suspense>
      </div>
    </CurrentUserContext.Provider>
  );
}

export default Main;
