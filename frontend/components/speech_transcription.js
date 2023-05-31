// define style rules to be programtically loaded
var style = document.createElement('style');
style.innerHTML = `

.speech-transcription-container{
    text-align:left;
    margin:30px;
}

.word{
    cursor: pointer;
}

.speech{
    padding: 5px 10px;
    margin: 5px;
    border-radius: 5px;
}

.current_word{
    border-bottom: solid #DB4437 3px;
}

.current_speech{
    border: solid 2px #4285F4;
}
`;
document.getElementsByTagName('head')[0].appendChild(style);


// define component
Vue.component('speech-transcription-viz', {
    props: ['json_data', 'video_info'],
    data: function () {
        return {
            interval_timer: null,
            current_time: 0,
            indexed_speech_cache: null,
        }
    },
    computed: {
        detected_speech: function () {
            `
            Extract just the speech transcriptions data from json
            `
            if (!this.json_data || !this.json_data.translatedText)
                return ""

            return this.json_data.translatedText
        },
    },
    template: `
    <div class="speech-transcription-container">
        <p >{{ detected_speech }}</p>
    </div>
    `
})