var app = new Framework7();

var $$ = Dom7;

var setCookie = function (cname, cvalue, exdays) {
    var d = new Date();
    d.setTime(d.getTime() + (exdays * 24 * 60 * 60 * 1000));

    var expires = 'expires=' + d.toUTCString();
    document.cookie = cname + '=' + cvalue + '; ' + expires;
}

var getCookie = function (cname) {
    var name = cname + '=';
    var ca = document.cookie.split(';');

    for (var i = 0; i < ca.length; i++) {
        var c = ca[i];
        while (c.charAt(0) == ' ') c = c.substring(1);
        if (c.indexOf(name) != -1) return c.substring(name.length, c.length);
    }

    return '';
}

var prompt = function() {
    var cookie = getCookie('id');
    
    app.prompt(cookie ? ('Son kullanılan Id: ' + cookie) : '', 'Post Id', function(id) {
        app.showPreloader('Lütfen bekleyin...');
        
        setCookie('id', id, 7);

        var getUsers = function(response) {
            var loggedIn = false;

            if (response.status === 'connected') {
                loggedIn = true;

                FB.api(
                    "/100004919073716_" + id + "/likes?limit=999999&summary=true",
                    function(response) {
                        app.hidePreloader();

                        if (response && !response.error) {
                            var i = 200,
                                n = 0,
                                random = null,
                                data = response.data,
                                count = response.summary.total_count;

                            if (count === 0) {
                                app.alert(null, 'Hiç beğeni yok!');
                            }
                            else {
                                $$('div.page-content').html(count + ' beğeni');

                                var putId = function() {
                                    var id = data[Math.floor(Math.random() * (count - 1))].id;

                                    var put = function() {
                                        if (n > 200) {
                                            clearTimeout(random);

                                            setTimeout(function() {
                                                $('div.page-content').fadeOut('slow', function() {
                                                    app.showPreloader('Lütfen bekleyin...');

                                                    FB.api('/' + id,
                                                        function(response) {
                                                            if (response && !response.error) {
                                                                var name = response.name;

                                                                FB.api('/' + id + '/picture?type=large',
                                                                    function(response) {
                                                                        if (response && !response.error) {
                                                                            var img = new Image();

                                                                            img.src = response.data.url;

                                                                            img.onload = function() {
                                                                                app.hidePreloader();
                                                                                
                                                                                $('div.page-content').html(
                                                                                    '<img src="{picture}" class="profile" />'
                                                                                    .replace('{picture}', response.data.url)
                                                                                ).fadeIn('slow', function () {
                                                                                    setTimeout(function () {
                                                                                        app.alert(name, 'Kazanan');
                                                                                    }, 250);
                                                                                });
                                                                            }
                                                                        }
                                                                        else {
                                                                            app.hidePreloader();
                                                                        }
                                                                    }
                                                                );
                                                            }
                                                            else {
                                                                app.hidePreloader();
                                                            }
                                                        }
                                                    );
                                                });
                                            }, 1000);
                                        }
                                        else {
                                            random = setTimeout(function() {
                                                n++;
                                                putId();
                                            }, i -= 3);
                                        }
                                    }

                                    $$('div.page-content').html(id);

                                    if (n === 0) {
                                        $('div.page-content').fadeIn('slow', function() {
                                            put();
                                        });
                                    }
                                    else {
                                        put();
                                    }
                                }
                                setTimeout(function() {
                                    $('div.page-content').fadeOut('slow', function() {
                                        putId();
                                    });
                                }, 1000);
                            }
                        }
                    }
                );
            }
            else if (response.status === 'not_authorized') {
                app.alert(null, 'Uygulama yetkilendirilmemiş.');
            }
            else {
                app.alert(null, 'Giriş yapılmamış.');
            }

            return loggedIn;
        }

        FB.getLoginStatus(function(response) {
            if (!getUsers(response)) {
                FB.login(function(response) {
                    getUsers(response);
                }, {
                    scope: 'user_posts'
                });
            }
        });
    });
}

$$('div.navbar .right .link').click(function() {
    prompt();
})

window.fbAsyncInit = function() {
    FB.init({
        appId: '874791115938636',
        version: 'v2.4',
        xfbml: true
    });

    setTimeout('prompt()', 750);
};

(function(d, s, id) {
    var js, fjs = d.getElementsByTagName(s)[0];
    if (d.getElementById(id)) {
        return;
    }
    js = d.createElement(s);
    js.id = id;
    js.src = "//connect.facebook.net/en_US/sdk.js";
    fjs.parentNode.insertBefore(js, fjs);
}(document, 'script', 'facebook-jssdk'));