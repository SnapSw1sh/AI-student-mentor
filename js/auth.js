document.addEventListener('DOMContentLoaded', function () {
    const loginForm = document.getElementById('login-form');
    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('password');
    const eyeIcon = document.querySelector('.input-box .eye-btn'); // querySelector - позволяет найти элемент, даже если у нее нет уникального ID, просто по цепочке классов.
    const errorMessage = document.getElementById('error-message');
    const SVG_OPEN_EYE = `<svg class="eye" width="21" height="18" viewBox="0 0 21 18" fill="none"
                    xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
                    <rect width="21" height="18" fill="url(#pattern0_527_29)" fill-opacity="0.6" />
                    <defs>
                        <pattern id="pattern0_527_29" patternContentUnits="objectBoundingBox" width="1" height="1">
                            <use xlink:href="#image0_527_29" transform="matrix(0.00857143 0 0 0.01 0.0714286 0)" />
                        </pattern>
                        <image id="image0_527_29" width="100" height="100" preserveAspectRatio="none"
                            xlink:href="data:image/png;base64,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" />
                    </defs>
                </svg>`;

    const SVG_CLOSED_EYE = `<svg class="eye" width="21" height="18" viewBox="0 0 21 18" fill="none" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
                    <rect width="21" height="18" fill="url(#pattern0_76_11)" fill-opacity="0.5"/>
                    <defs>
                        <pattern id="pattern0_76_11" patternContentUnits="objectBoundingBox" width="1" height="1">
                            <use xlink:href="#image0_76_11" transform="matrix(0.00857143 0 0 0.01 0.0714286 0)"/>
                        </pattern>
                        <image id="image0_76_11" width="100" height="100" preserveAspectRatio="none" 
                            xlink:href="data:image/png;base64,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"/>
                    </defs>
                </svg>`;

    // --- Переключение глаз ---
    if (eyeIcon) {
        eyeIcon.addEventListener('click', function () {
            // Переключаем тип инпута
            const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
            passwordInput.setAttribute('type', type);

            if (type === 'text') {
                eyeIcon.innerHTML = SVG_OPEN_EYE; //Поподробнее изучить innerHTML и почему div всё исправил в login.html
            } else {
                eyeIcon.innerHTML = SVG_CLOSED_EYE;
            }
        });
    }

    // --- Логика авторизации ---
    if (loginForm) {
        loginForm.addEventListener('submit', function (e) {
            e.preventDefault(); // Предотвращаем стандартную отправку формы

            let isValid = true;
            // Простая валидация: поля не должны быть пустыми
            // Можно добавить проверку на 'edu.hse.ru' если нужно
            // trim() - Убирает лишние пробелы в начале и в конце (если пользователь случайно нажал пробел).
            if (!emailInput.value.trim() || !passwordInput.value.trim()) {
                isValid = false;
            }

            // Для демонстрации: если почта не содержит "edu.hse.ru" - тоже ошибка
            if (emailInput.value.trim() && !emailInput.value.includes('edu.hse.ru')) {
                isValid = false;
            }

            if (!isValid) {
                showError('Неверная почта или пароль. Проверьте и попробуйте снова.');
            } else {
                // Если все ок - можно отправлять форму или делать редирект
                console.log('Form submitted successfully');
                // loginForm.submit(); // Раскомментировать для реальной отправки
            }
        });
    }

    function showError(message) {
        // Добавляем класс ошибки из CSS инпутам
        emailInput.classList.add('error');
        passwordInput.classList.add('error');
        // с margin проблема в дизайне
        errorMessage.style.marginTop = '-7px';
        // Показываем текст ошибки
        errorMessage.textContent = message;
    }

    function clearError() {
        // Убираем класс ошибки
        emailInput.classList.remove('error');
        if (passwordInput) passwordInput.classList.remove('error');
        // Очищаем текст
        errorMessage.textContent = '';
    }

    // Очистка ошибок при вводе
    if (emailInput) emailInput.addEventListener('input', clearError);
    if (passwordInput) passwordInput.addEventListener('input', clearError);

    // --- Логика РЕГИСТРАЦИИ ---
    const registerForm = document.getElementById('register-form');
    const regEmailInput = document.getElementById('reg-email');
    const regPassInput = document.getElementById('reg-password');
    const regPassConfirmInput = document.getElementById('reg-password-confirm');
    // Находим все кнопки-"глаза" внутри input-box на странице регистрации
    // (их там может быть две: для пароля и подтверждения)
    const regEyeBtns = document.querySelectorAll('#register-form .input-box .eye-btn'); // querySelectorAll - возвращает все найденные элементы

    // 1. Пароль Toggle для регистрации (работает с несколькими глазами)
    if (regEyeBtns.length > 0) {
        regEyeBtns.forEach(btn => {
            btn.addEventListener('click', function () {
                // Находим input, который лежит в том же родителе (.input-box), перед кнопкой
                const input = btn.previousElementSibling;
                if (input && input.tagName === 'INPUT') {
                    const type = input.getAttribute('type') === 'password' ? 'text' : 'password';
                    input.setAttribute('type', type);

                    if (type === 'text') {
                        btn.innerHTML = SVG_OPEN_EYE;
                    } else {
                        btn.innerHTML = SVG_CLOSED_EYE;
                    }
                }
            });
        });
    }

    // Форма регистрации
    if (registerForm) {
        // Функция для отображения ошибки на конкретном поле
        function showRegError(input, msg) {
            input.classList.add('error');
            errorMessage.textContent = msg;
            errorMessage.style.marginTop = '-7px';
        }

        // Функция для очистки ошибок
        function clearRegError(e) {
            e.target.classList.remove('error');
            // Если ошибок больше нет нигде, можно убрать текст
            const hasErrors = registerForm.querySelectorAll('.input-box input.error').length > 0;
            if (!hasErrors) {
                errorMessage.textContent = '';
            }
        }

        [regEmailInput, regPassInput, regPassConfirmInput].forEach(inp => {
            if (inp) inp.addEventListener('input', clearRegError);
        });

        registerForm.addEventListener('submit', function (e) {
            e.preventDefault();

            // Сброс визуальных ошибок
            [regEmailInput, regPassInput, regPassConfirmInput].forEach(inp => inp.classList.remove('error'));
            errorMessage.textContent = '';

            const emailVal = regEmailInput.value.trim();
            const passVal = regPassInput.value.trim();
            const passConfVal = regPassConfirmInput.value.trim();

            // Ошибка формата почты
            if (!emailVal || !emailVal.endsWith('@edu.hse.ru')) {
                showRegError(regEmailInput, 'Неверная почта для регистрации. Используйте @edu.hse.ru');
                return;
            }
            // Ошибка сущ. пользователя (Для примера, в будущем будет проверка на наличие пользователя в БД)
            if (emailVal === 'ivan@edu.hse.ru') {
                showRegError(regEmailInput, 'Пользователь с такой почтой уже зарегистрирован.');
                return;
            }

            // Ошибка длины пароля
            if (passVal.length < 8) {
                showRegError(regPassInput, 'Пароль должен содержать не менее 8 символов.');
                return;
            }

            // Ошибка символов пароля (только латинские буквы и цифры)
            if (!/^[a-zA-Z0-9]+$/.test(passVal)) {
                showRegError(regPassInput, 'Пароль должен содержать только латинские буквы и цифры.');
                return;
            }

            // Ошибка несовпадения паролей
            if (passVal !== passConfVal) {
                showRegError(regPassInput, 'Пароли не совпадают.');
                regPassConfirmInput.classList.add('error');
                return;
            }

            console.log('Registration success');
            window.location.href = 'register-successful.html';
        });
    }

    // --- Логика СБРОСА ПАРОЛЯ ---
    const resetForm = document.getElementById('reset-form');
    const resetEmailInput = document.getElementById('email');

    if (resetForm) {
        // Функция для отображения ошибки на конкретном поле
        function showResetError(input, msg) {
            input.classList.add('error');
            const errMsg = document.getElementById('error-message');
            if (errMsg) {
                errMsg.textContent = msg;
                errMsg.style.marginTop = '7px';
            }
        }

        function clearResetError(e) {
            e.target.classList.remove('error');
            const errMsg = document.getElementById('error-message');
            if (errMsg) errMsg.textContent = '';
        }

        if (resetEmailInput) {
            resetEmailInput.addEventListener('input', clearResetError);
        }

        resetForm.addEventListener('submit', function (e) {
            e.preventDefault();

            // Очистка ошибок
            if (resetEmailInput) resetEmailInput.classList.remove('error');
            const errMsg = document.getElementById('error-message');
            if (errMsg) errMsg.textContent = '';

            const emailVal = resetEmailInput.value.trim();

            // Ошибка формата почты
            if (!emailVal || !emailVal.endsWith('@edu.hse.ru')) {
                showResetError(resetEmailInput, 'Неверная почта. Используйте @edu.hse.ru');
                return;
            }

            // Ошибка несущ. пользователя (Для примера, в будущем будет проверка на наличие пользователя в БД)
            if (emailVal === 'ivan@edu.hse.ru') {
                showResetError(resetEmailInput, 'Пользователь с такой почтой не зарегистрирован.');
                return;
            }

            window.location.href = 'email-sent.html';
        });
    }

    // --- Логика НОВОГО ПАРОЛЯ ---
    const newPassForm = document.getElementById('new-password-form');
    const newPassInput = document.getElementById('new-password');
    const newPassConfirmInput = document.getElementById('new-password-confirm');
    const newPassEyeBtns = document.querySelectorAll('#new-password-form .input-box .eye-btn');

    // 1. Пароль Toggle для нового пароля
    if (newPassEyeBtns.length > 0) {
        newPassEyeBtns.forEach(btn => {
            btn.addEventListener('click', function () {
                const input = btn.previousElementSibling;
                if (input && input.tagName === 'INPUT') {
                    const type = input.getAttribute('type') === 'password' ? 'text' : 'password';
                    input.setAttribute('type', type);

                    if (type === 'text') {
                        btn.innerHTML = SVG_OPEN_EYE;
                    } else {
                        btn.innerHTML = SVG_CLOSED_EYE;
                    }
                }
            });
        });
    }

    if (newPassForm) {
        function showNewPassError(input, msg) {
            input.classList.add('error');
            const errMsg = document.getElementById('error-message');
            if (errMsg) {
                errMsg.textContent = msg;
                errMsg.style.marginTop = '7px';
            }
        }

        function clearNewPassError(e) {
            e.target.classList.remove('error');
            // Если ошибок больше нет нигде, можно убрать текст
            const hasErrors = newPassForm.querySelectorAll('.input-box input.error').length > 0;
            const errMsg = document.getElementById('error-message');
            if (!hasErrors && errMsg) {
                errMsg.textContent = '';
            }
        }

        [newPassInput, newPassConfirmInput].forEach(inp => {
            if (inp) inp.addEventListener('input', clearNewPassError);
        });

        newPassForm.addEventListener('submit', function (e) {
            e.preventDefault();

            // Сброс визуальных ошибок
            [newPassInput, newPassConfirmInput].forEach(inp => inp.classList.remove('error'));
            const errMsg = document.getElementById('error-message');
            if (errMsg) errMsg.textContent = '';

            const passVal = newPassInput.value.trim();
            const passConfVal = newPassConfirmInput.value.trim();

            // 1. Ошибка пустого пароля
            if (!passVal) {
                showNewPassError(newPassInput, 'Введите новый пароль.');
                return;
            }

            // 2. Ошибка длины пароля
            if (passVal.length < 8) {
                showNewPassError(newPassInput, 'Пароль должен содержать не менее 8 символов.');
                return;
            }

            // 3. Ошибка символов пароля (только латинские буквы и цифры)
            if (!/^[a-zA-Z0-9]+$/.test(passVal)) {
                showNewPassError(newPassInput, 'Пароль должен содержать только латинские буквы и цифры.');
                return;
            }

            // 4. Ошибка несовпадения паролей
            if (passVal !== passConfVal) {
                showNewPassError(newPassInput, 'Пароли не совпадают.');
                newPassConfirmInput.classList.add('error');
                return;
            }

            console.log('New password set successfully');
            // window.location.href = 'login.html'; // Пример редиректа
            // Для демонстрации покажем алерт или просто оставим лог
        });
    }
});
