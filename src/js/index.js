import $ from "jquery";
import popper from "popper.js";
import bootstrap from "bootstrap";
import '@fancyapps/fancybox';

$(function() {

});

'use strict'

let popupLogic = {
    //Главный статус, от которого работает вся логика (переключается по номеру слайда)
  status: 0,
  //Массив на отправку на бэк (формируется на 10ом слайде функцией prefinal)
  arrToSend: [],
  //Массив заголовков
  headers: [
    'Подберем 15 лучших предложений под ваши задачи',
    'В какой мессенджер вам прислать подборку',
    'С какой целью вы покупаете объект?',
    'Где вы хотите купить объект?',
    'Выберите желаемую площадь',
    'Выберите количество спален',
    'Расскажите что для вас важно',
    'Что насчет срока сдачи объекта?',
    'Выберите диапозон стоимости',
    'Предпочитаемый способ оплаты'
  ],
  //Массив речей менеджера
  managerSpeachs: [
    'Здравствуйте, вы готовы начать подбор?',
    'Выберите удобное для вас приложение',
    'Выберите, что соответствует вашим целям',
    'Выберите подходящие районы Москвы или укажите свой вариант',
    'Это необязательный вопрос, но он поможет нам сделать подборку точнее.',
    'Можно выбрать несколько вариантов.',
    'Отметьте любое количество параметров вашей недвижимости.',
    'Выберите подходящее значение с учетом желаемого срока покупки.',
    'Укажите максимальную сумму в рублях',
    'Выбрав "другое" вы можете списать свой вариант'
  ],
  //Массив номеров страниц
  pagesNumbers: [
     ,
    '- 1 из 9 -',
    '- 2 из 9 -',
    '- 3 из 9 -',
    '- 4 из 9 -',
    '- 5 из 9 -',
    '- 6 из 9 -',
    '- 7 из 9 -',
    '- 8 из 9 -',
    '- 9 из 9 -'
  ],
  //Массив радио-баттанов
  radios: [
    [],
    [],
    ['Для проживания', 'Для инвестиций', 'Все варианты'],
    ['В пределах МКАД', 'ЦАО', 'Запад', ' Восток', 'Север', 'Юг', 'Неважно'],
    ['20-60 м2', '60-100 м2', '100-140 м2', '140-180 м2', '180-220 м2', '220-260 м2', '260-300 м2;', '300+ м2'],
    ['Студия', '1 спальня', '2 спальни', '3+'],
    ['Готовая отделка', 'Двухуровневый', 'Рядом метро', 'Близость к центру', 'Есть паркинг', 'Рядом парки', 'Рядом арт-объекты'],
    ['Нужен уже сданный', 'Будет сдан в 2019', 'Не имеет значения', 'Не более 6 месяцев', 'Будет сдан в 2020'],
    ['4 - 10 млн. руб', '10 - 50 млн. руб', '100 - 150 млн. руб', '150 - 220 млн. руб', '200 - 250 млн. руб', '250+'],
    ['Наличные', 'Ипотека', 'Рассрочка', 'Другое']
  ],
  //Последняя кнопка
  lastHeader: 'Спасибо!',

  //Сохранение в sessionStorage. Формирует два массива для отправки и для внутреннего пользования
  //проверяет на пустоту, чтобы не затереть имеющиеся данные
  saveCache() {
    let allLabels = document.querySelectorAll('.popup-main__label'),
        allRadios = document.querySelectorAll('.popup-main__radio'),
        arrToSend = [],
        arrToScroll = [];

    for (let i=0;i<allRadios.length;++i) {
      if (allRadios[i].checked === true) {
        arrToSend.push(allLabels[i].textContent);
        arrToScroll.push(i);
      }
    }

    if (arrToSend[0] !== undefined) {
      sessionStorage.setItem(popupLogic.status, arrToSend);
    }
    if (arrToScroll[0] !== undefined) {
      sessionStorage.setItem(`i${popupLogic.status}`, arrToScroll);
    }
    
  },
  //Подргузка кэша
  loadCache() {
    try {
      let cache = sessionStorage.getItem(`i${popupLogic.status}`).split(','),
          allRadios = document.querySelectorAll('.popup-main__radio');

      for (let i=0; i<cache.length;++i) {
        allRadios[cache[i]].checked = true;
      }

    } catch(e) {
      console.log(e.message)
    }
  },
  //Кнопка "далее"
  //Увеличивает статус, убивает форму, после перехода к вводу номера
  //Сохраняет кэш, подгружает кэш, удаляет разного рода элементы, при переходах от слайда к слайду
  //Запускает рендер
  next() {
    if (popupLogic.status === 0) {
      ++status;
      popupLogic.render();
    }
    if (popupLogic.status === 9) {
      popupLogic.close();
      popupLogic.preFinal();
      ++popupLogic.status;
      return;
    }
    if (popupLogic.status > 1) {
      let radiosWrapper = document.querySelector('.popup-main__radios');

      popupLogic.saveCache();

      for(let i=radiosWrapper.children.length;i>0;--i) {
        radiosWrapper.children[0].remove();
      }

      ++popupLogic.status;
      popupLogic.render();
      popupLogic.loadCache();
    } else {
      ++popupLogic.status;
      popupLogic.render();
    }
  },
  //Примерно тоже самое, что и next, только в обратную сторону
  prev() {
    if (popupLogic.status > 1) {
      popupLogic.saveCache();

      let allRadios = document.querySelector('.popup-main__radios');

      for(let i=allRadios.children.length;i>0;--i) {
        allRadios.children[0].remove();
      }

      --popupLogic.status;
      popupLogic.render();
      popupLogic.loadCache();
    } else {
      --popupLogic.status;
      popupLogic.render();
    }
  },
  //Отправка формы (не дописал)
  sendForm() {

  },
  //Главная функция по сути.
  //Рендирит и всё запускает
  render() {
    let page = document.querySelector('.popup-main__page'),
        header = document.querySelector('.popup-main__header'),
        prevButton = document.querySelector('.popup-main__btn-prev'),
        managerSpeach = document.querySelector('.popup-main__manager-question p'),
        messengers = document.querySelector('.popup-main__messengers'),
        contentPar = document.querySelector('.popup-main__content p'),
        goOnButton = document.querySelector('.popup-main__btn-main'),
        allRadios = document.querySelector('.popup-main__radios');

    if (popupLogic.status > 1) {
      allRadios.setAttribute('style', 'display: flex');
      // popupLogic.unSelect();

      for(let i=0;i<popupLogic.radios[popupLogic.status].length;++i) {
        let input = document.createElement('input'),
            label = document.createElement('label');

        if (
          popupLogic.status === 5 || 
          popupLogic.status === 6 ||
          popupLogic.status === 9
        ) {
          input.name = i;
        } else {
          input.name = popupLogic.status;
        }

        input.type = 'radio';
        input.classList.add('popup-main__radio');
        input.id = i;

        label.textContent = popupLogic.radios[popupLogic.status][i];
        label.classList.add('popup-main__label');
        label.htmlFor = i;
        
        allRadios.appendChild(input);
        allRadios.appendChild(label);
      }

    } else {
      allRadios.setAttribute('style', 'display: none');
    }

    if (popupLogic.status === 10) {
      popupLogic.sendForm();
    }

    if (popupLogic.status > 0) {
      prevButton.setAttribute('style', 'display: inline-block');
      goOnButton.textContent = 'Далее';
    } else {
      prevButton.setAttribute('style', 'display: none');
    }

    if(popupLogic.status === 0) {
      contentPar.setAttribute('style', 'display: block');
      goOnButton.textContent = 'Начать';
    }

    if (popupLogic.status === 1) {
      messengers.setAttribute('style', 'display: flex');
      contentPar.setAttribute('style', 'display: none');
    } else {
      messengers.setAttribute('style', 'display: none');
    }

    managerSpeach.textContent = popupLogic.managerSpeachs[popupLogic.status];
    page.textContent = popupLogic.pagesNumbers[popupLogic.status];
    header.textContent = popupLogic.headers[popupLogic.status];

    popupLogic.unSelect();
  },
  //Запускает предпоследнее окно с вводом номера
  //Создает массив на отправку
  preFinal() {
    let preFinal = document.querySelector('.popup-second'),
        temp,
        tempArr,
        sendArray = [];
    
    preFinal.setAttribute('style', 'display: block');

    for(let i=0;i<10;i++) {
      if (sessionStorage.getItem(i) !== null) {
      tempArr = sessionStorage.getItem(i).split();

        if (tempArr.indexOf(',') !== -1) {
          sendArray[i] = (sessionStorage.getItem(i));
        } else {
          temp = sessionStorage.getItem(i).split(',');
          sendArray[i] = temp;
        }
      }
    }
    popupLogic.arrToSend = sendArray;
  },
  //Запускает последнее окно, закрывая все предыдущие
  final() {
    let form = document.querySelector('.popup-second__form'),
        hint = document.querySelector('.popup-second__hint'),
        socials = document.querySelector('.popup-second__socials'),
        description = document.querySelector('.popup-second__description'),
        header = document.querySelector('.popup-second__header'),
        closeBtn = document.querySelector('.popup-second__finalClose');

        form.setAttribute('style', 'display: none');
        hint.setAttribute('style', 'display: none');
        socials.setAttribute('style', 'display: none');
        description.setAttribute('style', 'display: block');
        header.textContent = 'Спасибо!';
        closeBtn.setAttribute('style', 'display: block');
        closeBtn.addEventListener('click', ev => {
            document.querySelector('.popup-second').remove();
        });
  },
    //Закрывает форму
//   close() {
//     document.querySelector('.popup-main').remove();
//   },
  //Недоработанная функция, которая отменяет чек бокс
  unSelect() {
      function select(ev) {
        let this_input = $(this);
        if (this_input.attr('checked1') == '11') {
            this_input.attr('checked1', '11')
        } else {
            this_input.attr('checked1', '22')
        }
        $('.popup-main__radio').prop('checked', false);

        if (this_input.attr('checked1') == '11') {
            this_input.prop('checked', false);
            this_input.attr('checked1', '22')
        }
        else {
            this_input.prop('checked', true);
            this_input.attr('checked1', '11')
        }
      }

    $('.popup-main__radio').on('click', select);
  }
}

let startupButton = document.querySelector('.popup-main__btn-main'),
    prevButton = document.querySelector('.popup-main__btn-prev'),
    closeButton = document.querySelector('.popup-main__btn-close');

startupButton.addEventListener('click', popupLogic.next);
prevButton.addEventListener('click', popupLogic.prev);
closeButton.addEventListener('click', popupLogic.close);

