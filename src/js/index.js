import $ from "jquery";
import '@fancyapps/fancybox';
import 'jquery.maskedinput/src/jquery.maskedinput';

$(function() {

  $('.js-start').fancybox({
    clickSlide: false,
    touch: false,
  });

  $(".input--phone").mask("+7 (999) 999-99-99");

  $(document).on('submit', '.popup-second__form', function(e) {
    e.preventDefault();
    sessionStorage.phone = $(".input--phone").val();
    let data = JSON.stringify(sessionStorage);
    $.ajax({
      url: 'mail.php',
      data: data,
      cache: false,
      contentType: false,
      processData: false,
      type: 'POST',
      success: function(data) {
        sessionStorage.clear();
        popupLogic.final();
      },
      error: function() {
        sessionStorage.clear();
        popupLogic.final();
      }
    });
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
      'Как вы хотите использовать лофт?',
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
      'Здравствуйте! Я прокомментирую для вас вопросы и варианты ответов.',
      'Выберите удобное для вас приложение',
      'Выберите, что соответствует вашим целям',
      'Выберите подходящие районы Москвы. Можно выбрать несколько вариантов',
      'Это необязательный вопрос, но он поможет нам сделать подборку точнее.',
      'Можно выбрать несколько вариантов.',
      'Отметьте любое количество параметров вашей недвижимости.',
      'Выберите подходящее значение с учетом желаемого срока покупки.',
      'Укажите максимальную сумму в рублях',
      'Выберите предпочитаемый способ оплаты'
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
      ['до 20 м2', '20-40 м2', '40-70 м2', '70-100 м2', '100-150 м2', '150+ м2'],
      ['Студия', '1 спальня', '2 спальни', '3+'],
      ['Готовая отделка', 'Двухуровневый', 'Рядом метро', 'Близость к центру', 'Есть паркинг', 'Рядом парки', 'Рядом арт-объекты'],
      ['Не более 6 мес', 'В 2019', 'В 2020', 'Нужен сданный', 'Не имеет значения'],
      ['4 - 10 млн. руб', '10 - 50 млн. руб', '100 - 150 млн. руб', '150 - 220 млн. руб', '200 - 250 млн. руб', '250+'],
      ['Наличные', 'Ипотека', 'Рассрочка', 'Другое']
    ],
    //Последняя кнопка
    lastHeader: 'Спасибо!',

    changeColorAndSave() {
      let elements = document.querySelectorAll('.popup-main__messenger');
      for (let i = 0; i < elements.length; i++) {
        elements[i].addEventListener('click', function() {
          for (let i = 0; i < elements.length; i++) {
            elements[i].classList.remove('active');
          }
          this.classList.add('active');

          for (let i = 0; i < elements.length; i++) {
            if (elements[i].classList[2] === 'active') {
              sessionStorage.setItem('1', elements[i].children[1].textContent);
              sessionStorage.setItem('i1', i);
            }
          }
        })
      }
    },

    //Сохранение в sessionStorage. Формирует два массива для отправки и для внутреннего пользования
    //проверяет на пустоту, чтобы не затереть имеющиеся данные
    saveCache() {
      let allLabels = document.querySelectorAll('.popup-main__label'),
        allRadios = $('.popup-main__radio'),
        arrToSend = [],
        arrToScroll = [];

      if (!allRadios.hasClass('popup-main__radio--multiply')) {
        for (let i = 0; i < allRadios.length; ++i) {
          if (allRadios[i].checked === true) {
            arrToSend.push(allLabels[i].textContent);
            arrToScroll.push(i);
          }
        }
      }
      else {
        for (let i = 0; i < allRadios.length; ++i) {
          if (allRadios[i].getAttribute('checked1') == '1') {
            arrToSend.push(allLabels[i].textContent);
            arrToScroll.push(i);
          }
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
        if (!sessionStorage.getItem(`i${popupLogic.status}`)) {
          return;
        }

        let cache = sessionStorage.getItem(`i${popupLogic.status}`).split(','),
          allRadios = document.querySelectorAll('.popup-main__radio');

        if (!allRadios[0].classList.contains('popup-main__radio--multiply')) {
          for (let i = 0; i < cache.length; ++i) {
            allRadios[cache[i]].checked = true;
          }
          return;
        }
        for (let i = 0; i < cache.length; ++i) {
          allRadios[cache[i]].setAttribute('checked1', 1);
        }


      } catch (e) {
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
        document.addEventListener('click', popupLogic.setBtnActive);
      }
      if (popupLogic.status === 9) {
        popupLogic.saveCache();
        popupLogic.close();
        ++popupLogic.status;
        popupLogic.preFinal();
        return;
      }
      if (popupLogic.status > 0) {
        let radiosWrapper = document.querySelector('.popup-main__radios');

        popupLogic.saveCache();

        for (let i = radiosWrapper.children.length; i > 0; --i) {
          radiosWrapper.children[0].remove();
        }

        ++popupLogic.status;
        popupLogic.render();
        popupLogic.loadCache();
      } else {
        ++popupLogic.status;
        popupLogic.render();
      }
      if (popupLogic.status === 1) {
        popupLogic.changeColorAndSave();
      }
    },
    setBtnActive: function() {
      let confirmBtn = document.querySelector('.popup-main__btn-main'),
          checkbox;

      if (popupLogic.status === 0) {
        confirmBtn.classList.add('activeBtn');        confirmBtn.addEventListener('click', popupLogic.next);
      }

      if (popupLogic.status === 1) {
        confirmBtn.removeEventListener('click', popupLogic.next);
        confirmBtn.classList.remove('activeBtn');
        let checkBoxes = document.querySelectorAll('.popup-main__messenger');

        doActiveBtn(checkBoxes);
      }

      if (
        popupLogic.status > 1 && 
        popupLogic.status <= 9 &&
        popupLogic.status !== 3
        ) {
        confirmBtn.removeEventListener('click', popupLogic.next);
        confirmBtn.classList.remove('activeBtn');
        let radios = document.querySelectorAll('.popup-main__radio');

        popupLogic.status > 3 ? doActiveBtn(radios, true) : doActiveBtn(radios);
      }

      if (popupLogic.status === 11) {
        let confirmBtn = document.querySelector('.popup-second__submit');
        confirmBtn.classList.remove('activeBtn');

        let checkbox = document.querySelector('#lastInpt'),
          input = document.querySelector('.input--phone');

        if (~input.value.search(/\+7\s\([0-9]{3}\)\s[0-9]{3}\-[0-9]{2}\-[0-9]{2}/) && checkbox.checked == true) {
          confirmBtn.classList.add('activeBtn');
        }

      }

      function doActiveBtn(checkBoxes, radio = false) {
        for (checkbox of checkBoxes) {
          if (radio) {
            if (checkbox.getAttribute('checked1') == 1) {
              confirmBtn.classList.add('activeBtn');
              confirmBtn.addEventListener('click', popupLogic.next);
            }
          } else {
            if (checkbox.classList.contains('active') ||
            checkbox.checked == true ||
            checkbox.getAttribute('checked1') == 1) {
              confirmBtn.classList.add('activeBtn');
              confirmBtn.addEventListener('click', popupLogic.next);
            }
          }
        }
      }

    },
    //Примерно тоже самое, что и next, только в обратную сторону
    prev() {
      if (popupLogic.status > 1) {
        popupLogic.saveCache();

        let allRadios = document.querySelector('.popup-main__radios');

        for (let i = allRadios.children.length; i > 0; --i) {
          allRadios.children[0].remove();
        }

        --popupLogic.status;
        popupLogic.render();
        popupLogic.loadCache();
      } else {
        --popupLogic.status;
        popupLogic.render();
      }
      if (popupLogic.status === 1) {
        popupLogic.changeColorAndSave()
        popupLogic.loadCache();
      }
    },
    //Главная функция.
    //Рендирит и всё запускает
    render() {
      let page = document.querySelector('.popup-main__page'),
        header = document.querySelector('.popup-main__header'),
        prevButton = document.querySelector('.popup-main__btn-prev'),
        managerSpeach = document.querySelector('.popup-main__manager-question p'),
        messengers = document.querySelector('.popup-main__messengers'),
        contentPar = document.querySelector('.popup-main__content p'),
        goOnButton = document.querySelector('.popup-main__btn-main'),
        allRadios = document.querySelector('.popup-main__radios'),
        label;

      function roundLabel() {
        let labels = document.querySelectorAll('.popup-main__radios label');

        for (label of labels) {
          label.classList.toggle('round-label');
        }
      }

      if (popupLogic.status > 1) {
        allRadios.setAttribute('style', 'display: flex');

        for (let i = 0; i < popupLogic.radios[popupLogic.status].length; ++i) {
          let input = document.createElement('input'),
            label = document.createElement('label');

          if (
            popupLogic.status === 3 ||
            popupLogic.status === 4 ||
            popupLogic.status === 5 ||
            popupLogic.status === 6 ||
            popupLogic.status === 7 ||
            popupLogic.status === 8 ||
            popupLogic.status === 9
          ) {
            input.name = i;
            input.classList.add('popup-main__radio--multiply');
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

      // if (popupLogic.status === 10) {
      //   popupLogic.sendForm();
      // }

      if (popupLogic.status > 0) {
        $('.popup-main__btn').css('margin-top', 'auto');
        prevButton.setAttribute('style', 'display: inline-block');
        goOnButton.textContent = 'Далее';
      } else {
        prevButton.setAttribute('style', 'display: none');
      }

      if (popupLogic.status === 0) {
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
      if (popupLogic.status === 2) {
        roundLabel();
      }
    },
    //Запускает предпоследнее окно с вводом номера
    //Создает массив на отправку
    preFinal() {
      let phonePopup = document.querySelector('.popup-second'),
          spinner = document.querySelector('.spinner'),
          // thnxPopup = document.querySelector('.popup-second--preSecond'),
          temp,
          tempArr,
          sendArray = [];

      if (popupLogic.status === 10) {
        spinner.style.display = 'flex';
        let close = document.querySelector('.fancybox-close-small');
        close.style.display = 'none';
        setTimeout(function() {
          close.style.display = 'block';
          spinner.style.display = 'none';
          phonePopup.style.display = 'block';
          ++popupLogic.status;

          // let confirm = document.querySelector('.popup-second__submit--preSecond');

          // confirm.addEventListener('click', function() {
            // thnxPopup.style.display = 'none';
            // popupLogic.preFinal();
          // });
        }, 2000);
        return;
      } else {
        document.addEventListener('keydown', popupLogic.setBtnActive);
        phonePopup.setAttribute('style', 'display: block');
        // bonus.style.display = 'none';
  
        for (let i = 0; i < 10; i++) {
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
        sessionStorage.clear();
      }
    },
    //Запускает последнее окно, закрывая все предыдущие
    final() {
      $('.popup-second').css({'height' : '360px', 'padding' : '55px 10px 111px 10px'});
      let form = document.querySelector('.popup-second__form'),
        description = document.querySelector('.popup-second__description'),
        header = document.querySelector('.popup-second__header'),
        bonus = document.querySelector('.bonus'),
        bonusText = document.querySelector('.popup-second__bonus-text'),
        lastLabel = document.querySelector('#lastLabel');

      form.setAttribute('style', 'display: none');
      bonus.style.display = 'block';
      bonus.href = '#';
      bonus.children[1].style.display = 'none';
      bonusText.style.display = 'block';
      lastLabel.style.display = 'none';
      description.setAttribute('style', 'display: block');
      header.textContent = 'Спасибо!';
    },
    //Закрывает форму
    close() {
      document.querySelector('.popup-main').remove();
    },
    //функция, которая отменяет чек бокс
    unSelect() {
      function select() {
        let $input = this;
        if ($input.getAttribute('checked1')) {
          if ($input.getAttribute('checked1') === '1') {
            $input.setAttribute('checked1', 2)
            popupLogic.setBtnActive();
          }
          else {
            $input.setAttribute('checked1', 1)
            popupLogic.setBtnActive();
          }
          return;
        }
        $input.setAttribute('checked1', 1)
      }

      $('.popup-main__radio--multiply').on('click', select);
    }
  };

  let startupButton = document.querySelector('.popup-main__btn-main'),
    prevButton = document.querySelector('.popup-main__btn-prev');

  startupButton.addEventListener('click', popupLogic.next);
  prevButton.addEventListener('click', popupLogic.prev);
});