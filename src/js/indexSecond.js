import $ from "jquery";
import '@fancyapps/fancybox';
import 'jquery.maskedinput/src/jquery.maskedinput';

$(function() {

  $('.js-start').fancybox({
    clickSlide: false,
    touch: false,
    beforeClose: function(){sessionStorage.clear()}
  });

  $(".input--phone").mask("+7 (999) 999-99-99");

  $(document).on('click', '.popup-second__submit', function(e) {
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
      'Подберите 7 лучших предложений для инвестиций в недвижимость Москвы',
      'В какой мессенджер вам прислать подборку?',
      'Сколько вы хотите вложить?',
      'Выберите направление инвестирования',
      'Типы объектов для инвестирования',
      'Источник средств для инвестиций?',
      'Рассмотрите ли варианты совместного инвестирования с нами или другими инвесторами?',
    ],
    //Массив речей менеджера
    managerSpeachs: [
      'Здравствуйте! Я прокомментирую для вас вопросы и варианты ответов.',
      'Выберите удобное для вас приложение.',
      'Укажите, какую сумму вы готовы инвестировать.',
      'Сдача в аренду подойдет, если вы хотите получать регулярный доход, но она проигрывает по доходности перепродаже объектов.',
      'Можете выбрать несколько вариантов.',
      'Это необязательный вопрос, но ответ поможет нам точнее рассчитать окупаемость.',
      'Мы готовы вложить собственные средства вместе с Вами и разделить риски.',
    ],
    //Массив номеров страниц
    pagesNumbers: [
      ,
      '- 1 из 6 -',
      '- 2 из 6 -',
      '- 3 из 6 -',
      '- 4 из 6 -',
      '- 5 из 6 -',
      '- 6 из 6 -',
    ],
    //Массив радио-баттанов
    radios: [
      [],
      [],
      ['от 5 до 15 млн. руб.', 'от 15 до 30 млн. руб.', 'от 30 до 60 млн. руб.', 'больше 60 млн. руб.'],
      ['Покупка объекта для сдачи в аренду', 'Покупка объекта для перепродажи'],
      ['Жилая недвижимость', 'Коммерческая недвижимость', 'Другое'],
      ['Собственные средства', 'Ипотечный кредит', 'Рассрочка', 'Другое'],
      ['Да, пришлите варианты и для совместного инвестирования', 'Нет, мне это не подходит'],
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
      if (popupLogic.status === 6) {
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
        confirmBtn.classList.add('activeBtn');
        confirmBtn.addEventListener('click', popupLogic.next);
      }

      if (popupLogic.status === 1) {
        confirmBtn.removeEventListener('click', popupLogic.next);
        confirmBtn.classList.remove('activeBtn');
        let checkBoxes = document.querySelectorAll('.popup-main__messenger');

        doActiveBtn(checkBoxes);
      }

      if (
        popupLogic.status !== 5 &&
        popupLogic.status > 1 &&
        popupLogic.status < 7
        ) {
        confirmBtn.removeEventListener('click', popupLogic.next);
        confirmBtn.classList.remove('activeBtn');
        let radios = document.querySelectorAll('.popup-main__radio');

        if (popupLogic.status === 3 || popupLogic.status === 4) {
          doActiveBtn(radios, true);
        } else {
          doActiveBtn(radios, false);
        }
      }

      if (popupLogic.status === 5) {
        confirmBtn.classList.add('activeBtn');
        confirmBtn.addEventListener('click', popupLogic.next);
      }

      if (popupLogic.status === 8) {
        document.addEventListener('keyup', popupLogic.setBtnActive);

        let confirmBtn = document.querySelector('.popup-second__submit');
        confirmBtn.classList.remove('activeBtn');
        confirmBtn.setAttribute('disabled', '');

        let checkbox = document.querySelector('#lastInpt'),
          input = document.querySelector('.input--phone');

        if (~input.value.search(/\+7\s\([0-9]{3}\)\s[0-9]{3}\-[0-9]{2}\-[0-9]{2}/) && checkbox.checked == true) {
          confirmBtn.classList.add('activeBtn');
          confirmBtn.removeAttribute('disabled');
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
            popupLogic.status === 4
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
        goOnButton.textContent = 'Подобрать объекты';
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
      if (popupLogic.status === 2 || popupLogic.status === 5 || popupLogic.status === 6) {
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

      if (popupLogic.status === 7) {
        spinner.style.display = 'flex';
        let close = document.querySelector('.fancybox-close-small');
        close.style.display = 'none';
        setTimeout(function() {
          close.style.display = 'block';
          spinner.style.display = 'none';
          phonePopup.style.display = 'block';
          ++popupLogic.status;
          popupLogic.preFinal();
        }, 2000);
        return;
      } else {
        // phonePopup.setAttribute('style', 'display: block');
        // bonus.style.display = 'none';
  
        for (let i = 0; i < 7; i++) {
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