const request = require('request');
const schedule = require('node-schedule');
const config = require('./config');

const weatherOptions = {
    url: 'http://apis.skplanetx.com/weather/summary?&version=1&stnid=&lat='+config.lat+'&lon='+config.long,
    headers: {
        'Accept': 'application/json',
        'appKey': config.skWeatherappKey
    }
};
const dustOptions = {
    url: 'http://apis.skplanetx.com/weather/dust?version=1&lat='+config.lat+'&lon='+config.long,
    headers: {
        'Accept': 'application/json',
        'appKey': config.skWeatherappKey
    }
};

const ultravioletOptions = {
    url: 'http://apis.skplanetx.com/weather/windex/uvindex?version=1&lat='+config.lat+'&lon='+config.long,
    headers: {
        'Accept': 'application/json',
        'appKey': config.skWeatherappKey
    }
};
const lineOptions = {
    url: 'https://notify-api.line.me/api/notify',
    headers: {
        'Authorization': 'Bearer '+config.lineAppKey
    },
    formData: {
        'message': ''
    }
};

function getTodayWeather() {
    return new Promise((resolve, reject) => {
        request(weatherOptions, (error, response, body) => {
            if (!error && response.statusCode === 200) {
                const info = JSON.parse(body);
                let today = new Date();
                lineOptions.formData.message += '\n[오늘' + today.getFullYear() + '. ' + (today.getMonth() + 1) + '. ' + today.getDate() + '의 날씨]\n';
                switch (info.weather.summary[0].today.sky.name) {
                    case '맑음':
                        lineOptions.formData.message += '맑음☀️ ';
                        break;
                    case '구름조금':
                        lineOptions.formData.message += '구름조금🌤 ';
                        break;
                    case '비':
                        lineOptions.formData.message += '비☔️ ';
                        break;
                    case '구름많음':
                        lineOptions.formData.message += '구름많음⛅️️ ';
                        break;
                    case '흐림':
                        lineOptions.formData.message += '흐림🌥 ';
                        break;
                    case '눈':
                        lineOptions.formData.message += '눈⛄ ';
                        break;
                    case '비 또는 눈':
                        lineOptions.formData.message += '비☔ 또는 눈⛄️ ';
                        break;
                }
                lineOptions.formData.message += '\n' +
                    Math.round(info.weather.summary[0].today.temperature.tmin) + '℃ / '
                    + Math.round(info.weather.summary[0].today.temperature.tmax) + '℃\n';
                return resolve('success get Today Weather');
            } else {
                return reject('error get Today Weather');
            }
        });
    });
}

function getTomorrowWeather() {
    return new Promise((resolve, reject) => {
        request(weatherOptions, (error, response, body) => {
            if (!error && response.statusCode === 200) {
                const info = JSON.parse(body);
                let today = new Date();
                lineOptions.formData.message += '\n――――――――――――――\n';
                lineOptions.formData.message += '[내일' + today.getFullYear() + '. ' + (today.getMonth() + 1) + '. ' + (today.getDate() + 1) + '의 날씨]\n';
                switch (info.weather.summary[0].tomorrow.sky.name) {
                    case '맑음':
                        lineOptions.formData.message += '맑음☀️ ';
                        break;
                    case '구름조금':
                        lineOptions.formData.message += '구름조금🌤 ';
                        break;
                    case '비':
                        lineOptions.formData.message += '비☔️ ';
                        break;
                    case '구름많음':
                        lineOptions.formData.message += '구름많음⛅️️ ';
                        break;
                    case '흐림':
                        lineOptions.formData.message += '흐림🌥 ';
                        break;
                    case '눈':
                        lineOptions.formData.message += '눈⛄ ';
                        break;
                    case '비 또는 눈':
                        lineOptions.formData.message += '비☔ 또는 눈⛄️ ';
                        break;
                }
                lineOptions.formData.message += '\n' +
                    Math.round(info.weather.summary[0].tomorrow.temperature.tmin) + '℃ / '
                    + Math.round(info.weather.summary[0].tomorrow.temperature.tmax) + '℃\n';
                return resolve('success get Tomorrow Weather');
            } else {
                return reject('error get Tomorrow Weather');
            }
        });
    });
}

function getDustInfo() {
    return new Promise((resolve, reject) => {
        request(dustOptions, (error, response, body) => {
            if (!error && response.statusCode === 200) {
                const info = JSON.parse(body);
                lineOptions.formData.message += "미세먼지 : ";
                switch (info.weather.dust[0].pm10.grade) {
                    case '좋음':
                        lineOptions.formData.message += '좋음 🍀';
                        break;
                    case '보통':
                        lineOptions.formData.message += '보통 🤔';
                        break;
                    case '약간나쁨':
                        lineOptions.formData.message += '약간 나쁨 🤒';
                        break;
                    case '나쁨':
                        lineOptions.formData.message += '나쁨 🤧';
                        break;
                    case '매우나쁨':
                        lineOptions.formData.message += '매우 나쁨 😷';
                        break;
                }
                return resolve('success Dust Info');

            }
            else {
                console.log('error Dust Info');
                return reject(error);
            }

        });
    });
}

function getUltravioletInfo() {
    return new Promise((resolve, reject) => {
        request(ultravioletOptions, (error, response, body) => {
            if (!error && response.statusCode === 200) {
                const info = JSON.parse(body);
                lineOptions.formData.message += "\n자외선지수 : " +info.weather.wIndex.uvindex[0].day00.index+ '\n';
                lineOptions.formData.message += "\n자외선지수 : " +info.weather.wIndex.uvindex[0].day00.comment+ '\n';

                return resolve('success Ultraviolet Info');

            }
            else {
                console.log('error Ultraviolet Info');
                return reject(error);
            }

        });
    });
}

function sendLine() {
    return new Promise((resolve, reject) => {
        request.post(lineOptions, (error, response, body) => {
            if (error) {
                console.log('error Send line');
                return reject(error);
            }
            console.log('Send successful!  Server responded with:', body);
            resolve(body);

        });
    });
}

function initLineMessage(){
    lineOptions.formData.message = "";
}

schedule.scheduleJob('0 0 7 * * *', async () => {
    try {
        initLineMessage();
        await getTodayWeather();
        await getDustInfo();
        await getUltravioletInfo();
        await getTomorrowWeather();
        await sendLine();
    } catch (err) {
        console.log(err);
    }

});
