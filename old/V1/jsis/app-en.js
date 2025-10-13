//Recupera o conteudo do formulário em variáveis
const form = document.querySelector('#mensagis');
const usernameInput = document.querySelector('#firstName');
const emailInput = document.querySelector('#eMail');

//verifica se tem erros
function isFormValid(){
    //seleciona todos os campos do formulário que tem a classe verifiquis
    const inputContainers = form.querySelectorAll('.verifiquis');
    //coloca o valor true na variável result
    let result = true;
    //verifica em todos os campos do formulário se contem a classe error
    inputContainers.forEach((container)=>{
        if(container.classList.contains('error')){
            //muda valor da variável para false
            result = false;
        }
    });
    return result;
}

function validateForm() {
    //verifica se o nome inserido está vazio.
    if(usernameInput.value.trim()==''){
        //cria erro vazio
        setError(usernameInput, 'Name can not be empty.');
    //verifica se o nome tem a quantidade de letras certa
    }else if(usernameInput.value.trim().length <4 || usernameInput.value.trim().length > 15){
        //cria erro qtde de letras
        setError(usernameInput, 'Name must be min 4 and max 15 charecters.');
    //se não existem erros seta como sucesso.
    }else {
        setSuccess(usernameInput);
    }
    //verifica se o nome inserido está vazio.
    if(emailInput.value.trim()==''){
        //cria erro vazio
        setError(emailInput, 'Provide email address.');
    //verifica se o email tem os caracteres necessários e se nao tem os proibidos
    }else if(isEmailValid(emailInput.value)){
        //cria erro formato inválido
        setSuccess(emailInput);
    //se não existem erros seta como sucesso.
    }else{
        setError(emailInput, 'Provide valid email address');
    }
}
//marca erro
function setError(element, errorMessage) {
    //definine as variáveis
    const parent = element.parentElement; //variável parent contem o item do formulário que sera trabalhado
    const paragraph = parent.querySelector('p');//próximo <p> do html
    const noked = parent.querySelector('.nokisis');//proximo item com classe nokisis
    const oked = parent.querySelector('.okisis');//proximo item com classe okisis
    //verifica se tem a classe success 
    if(parent.classList.contains('success')){
        //se tem a classe remove
        parent.classList.remove('success');
    }
    //cria variável escondidis com o valor vazius
    let escondidis ="vazius";
    //passa de atributo em atributo
    for (let i = 0; i < oked.attributes.length; i++){
        //verifica se o atributo se chama hidden
        if(oked.attributes[i].name == "hidden"){
            //se sim muda o valor da variável escondidis para tem
            escondidis="tem";
        };
    }
    //verifica se a variável escondidis tem o conteudo igual a vazius
    if(escondidis=="vazius"){
        //se tiver cria atributo hidden
        oked.setAttribute('hidden','');
    }
    //adiciona a classe erro
    parent.classList.add('error');
    //coloca no html o valor do erro
    paragraph.textContent = errorMessage;
    //mostra o icone de ! na frente do formulário
    noked.removeAttribute("hidden");
}

function setSuccess(element){
    //definine as variáveis
    const parent = element.parentElement; //variável parent contem o item do formulário que sera trabalhado
    const noked = parent.querySelector('.nokisis');//proximo item com classe nokisis
    const oked = parent.querySelector('.okisis');//proximo item com classe okisis
    //verifica se tem a classe error 
    if(parent.classList.contains('error')){
        //se tem a classe remove
        parent.classList.remove('error');
    }
    //cria variável escondidis com o valor vazius
    let escondidis ="vazius";
    //passa de atributo em atributo
    for (let i = 0; i < noked.attributes.length; i++){
        //verifica se o atributo se chama hidden
        if(noked.attributes[i].name == "hidden"){
            //se sim muda o valor da variável escondidis para tem
            escondidis="tem";
        };
    }
    //verifica se a variável escondidis tem o conteudo igual a vazius
    if(escondidis=="vazius"){
        //se tiver cria atributo hidden
        noked.setAttribute('hidden','');
    }

    //adiciona a classe erro
    parent.classList.add('success');
    //mostra o icone de check na frente do formulário
    oked.removeAttribute("hidden");
}
//verifica os caracteres o emnail
function isEmailValid(email){
    //caracteres a testar
    const reg =/^(([^<>()[\]\.,;:\s@\"]+(\.[^<>()[\]\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()[\]\.,;:\s@\"]+\.)+[^<>()[\]\.,;:\s@\"]{2,})$/i;

    return reg.test(email);
}