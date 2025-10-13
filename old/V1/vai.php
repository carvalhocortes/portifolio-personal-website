<?php
    ini_set( 'display_errors', 1 );//vefica se há erros
    error_reporting( E_ALL );//vefica se há erros
    //cria variáveis
    $firstName;$lastName;$from;$message;$captcha;
    //recupera as variáveis enviadas
    $firstName = filter_input(INPUT_POST, 'firstName', FILTER_SANITIZE_STRING);
    $lastName = filter_input(INPUT_POST, 'lastName', FILTER_SANITIZE_STRING);
    $from = filter_input(INPUT_POST, 'eMail', FILTER_SANITIZE_STRING);
    $message = filter_input(INPUT_POST, 'message', FILTER_SANITIZE_STRING);
    $captcha = filter_input(INPUT_POST, 'token', FILTER_SANITIZE_STRING);
    
    $to = "contato@carvalhocortes.com.br"; //para quem vai mandar o email
    $subject = "Contato via site do " . $firstName; //titulo do email
    $headers = "From:" . $from . "\r\n"; //quem mandou o email
    $headers .= "MIME-Version: 1.0" . "\r\n"; // define que é formato HTML
    $headers .= "Content-type:text/html;charset=UTF-8" . "\r\n"; // define que é formato HTML
    //$headers .= 'Cc:' . $from . "\r\n"; // com copia para quem mandou a mensagem
    //verifica se tem mensagem

    if(!$message){
        $message = "Aaaaaaaaaaaaa ele se esqueceu de mandar uma mensagem. Melhor você escrever de volta pra ele.";
    };

    //corpo do email
    $corpoEmail = '
<html>
    <head>
        <title>E-mail de contato do site</title>
    </head>
    <body>
        <p style="font-size: 2rem">Você recebeu um e-mail&nbsp; do seu site.</p>
        <p style="font-size: 1.5rem">O querido do <strong>' . $firstName . ' ' . $lastName . '</strong>, mandou a seguinte mensagem:</p>
        <p style="font-size: 1.2rem"><em>' . $message . '</em></p>
        <p style="font-size: 1.5rem">Não se esqueca de responder.</p>
    </body>
</html>
    '; 
    //verifica se o token não está vazio
    if(!$captcha){
        echo '
            Please check the the captcha form.
            ';
        exit;
    }
    //chave secreta do reCaptcha
    $secretKey = "6Ld8U8AeAAAAAGrVRnC8Bj5HzVBG3_g9J8QtD6Td";
    //verificação do reCapcha
    $ip = $_SERVER['REMOTE_ADDR'];

    $url = 'https://www.google.com/recaptcha/api/siteverify';
    $data = array('secret' => $secretKey, 'response' => $captcha);

    $options = array(
        'http' => array(
        'header'  => "Content-type: application/x-www-form-urlencoded\r\n",
        'method'  => 'POST',
        'content' => http_build_query($data)
        )
    );
    $context  = stream_context_create($options); 
    $response = file_get_contents($url, false, $context); //variável com a resposta do reCaptcha
    $responseKeys = json_decode($response,true); //separa a resposta em um array
    header('Content-type: application/json');
    //verifica se a resposta do reCaptcha é verdadeira
    if($responseKeys["success"]) {
        //envia resposta para o site com um array com valor verdadeiro
        echo json_encode(array('success' => 'true'));
        //envia o e-mail
        mail($to,$subject,$corpoEmail, $headers);
    } else {
        //envia resposta para o site com um array com valor falso
        echo json_encode(array('success' => 'false'));
    }
?>