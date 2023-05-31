var style = document.createElement('style');
style.innerHTML = `

@import url(https://fonts.googleapis.com/css?family=Roboto);

.segment-container{
    text-align: center;
    margin:10px;
}

.segment{
    position: absolute; 
    background-color: rgb(255,64,129);
    height: 1em;
    border-radius: 5px;
    min-width: 5px;
    cursor: pointer;
}

.label{
    display: inline-block;
    background-color:  rgb(255,64,129);
    color: white;
    padding: 5px;
    font-size: 1.1em;
    vertical-align: middle;
    width: 10%;
    min-width: 190px;
    border-radius: 5px;
}

.segment-timeline{
    width: 100%;
    position: relative; 
    height: 1em;

    display: inline-block;
    vertical-align: middle;
    width: 80%;
    background-color: #f5f5f5;
    padding: 5px;
    border-radius: 5px;
}

.segments-enter-active, .segments-leave-active , .segment-container{
    transition: all 0.2s;
  }

.segments-enter, .segments-leave-to /* .list-leave-active below version 2.1.8 */ {
    opacity: 0;
    transform: translateY(30px);
}

.confidence {
    text-align: center;
    margin: 20px;
    font-size: 1.2em;
}

.confidence > input {
    width: 300px;
    vertical-align: middle;
}

.confidence > .confidence-value{
    display: inline-block;
    text-align: left;
    width: 60px;
}

.time-ticker{
    height:100%;
    width: 1px;
    background-color: gray;
}

`;
document.getElementsByTagName('head')[0].appendChild(style);

Vue.component('object-tracking-viz', {
    props: ['json_data', 'video_info'],
    data: function () {
        return {
            confidence_threshold: 0.5,
            interval_timer: null,
            ctx: null
        }
    },
    computed: {
        object_tracks: function () {
            if (!this.json_data || !this.json_data.videoJSON || !this.json_data.videoJSON.annotationResults)
                return []

            for (let index = 0; index < this.json_data.videoJSON.annotationResults.length; index++) {
                if ('objectAnnotations' in this.json_data.videoJSON.annotationResults[index])
                    return this.json_data.videoJSON.annotationResults[index].objectAnnotations
            }
            return []
        },

        indexed_object_tracks: function () {
            const indexed_tracks = []

            this.object_tracks.forEach(element => {
                if (element.confidence > this.confidence_threshold)
                    indexed_tracks.push(new Object_Track(element, this.video_info.height, this.video_info.width))
            })

            return indexed_tracks
        },

        object_track_segments: function () {
            const segments = {}

            this.indexed_object_tracks.forEach(object_tracks => {

                if (!(object_tracks.name in segments))
                    segments[object_tracks.name] = { 'segments': [], 'count': 0 }

                segments[object_tracks.name].count++

                var added = false

                for (let index = 0; index < segments[object_tracks.name].length; index++) {

                    const segment = segments[object_tracks.name].segments[index]
                    if (object_tracks.start_time < segment[1]) {
                        segments[object_tracks.name].segments[index][1] = Math.max(segments[object_tracks.name].segments[index][1], object_tracks.end_time)
                        added = true
                        break
                    }
                }

                if (!added)
                    segments[object_tracks.name].segments.push([object_tracks.start_time, object_tracks.end_time])
            })

            return segments
        }
    },
    methods: {
        segment_style: function (segment) {
            return {
                left: ((segment[0] / this.video_info.length) * 100).toString() + '%',
                width: (((segment[1] - segment[0]) / this.video_info.length) * 100).toString() + '%',
            }
        },
        segment_clicked: function (segment_data) {
            this.$emit('segment-clicked', { seconds: segment_data[0] - 0.5 })
        }
    },
    template: `
    <div class="object-tracking-container">
        <div class="confidence">
            <span>Confidence threshold</span>
            <input type="range" min="0.0" max="1" value="0.5" step="0.01" v-model="confidence_threshold">
            <span class="confidence-value">{{confidence_threshold}}</span>
        </div>

        <div class="data-warning" v-if="object_tracks.length == 0">No data available, yet.</div>

        <transition-group name="segments" tag="div">
            
            <div class="segment-container" v-for="segments, key in object_track_segments" v-bind:key="key + 'z'">
                <div class="label">{{key}} ({{segments.count}})</div>
                <div class="segment-timeline">
                    <div class="segment" v-for="segment in segments.segments" 
                                        v-bind:style="segment_style(segment)" 
                                        v-on:click="segment_clicked(segment)"
                    ></div>
                </div>
            </div>
        </transition-group>
    </div>
    `,
})

class Object_Track {
    constructor(json_data, video_height, video_width) {
        this.name = json_data.entity.description
        this.start_time = nullable_time_offset_to_seconds(json_data.segment.startTimeOffset)
        this.end_time = nullable_time_offset_to_seconds(json_data.segment.endTimeOffset)
        this.confidence = json_data.confidence
    }
}
