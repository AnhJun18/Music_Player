
const $ = document.querySelector.bind(document)
const $$ = document.querySelectorAll.bind(document);

const PLAYER_STORAGE_KEY = 'F8-PLAYER'

const cd= $('.cd')
const heading = $('header h2')
const cbThumb = $('.cd-thumb')
const audio = $('#audio')
const playBtn= $('.btn-toggle-play')
const progress = $('#progress')
const nextBtn = $('.btn-next')
const prevBtn = $('.btn-prev')
const randomBtn = $('.btn-random')
const repeatBtn = $('.btn-repeat')
const playlist = $('.playlist')


        
const app={
    currentIndex : 0,
    isPlaying : false,
    isRepeat : false,
    isRandom : false,
    config : JSON.parse(localStorage.getItem(PLAYER_STORAGE_KEY) )|| {},
    songs:[
        {
            name: 'Nevada',
            singer: 'Vicetone',
            path: './assets/music/nevada.mp3',
            image: './assets/img/nevada.jpg'
        },
        {
            name: 'Save Me',
            singer: 'DEAMN',
            path: './assets/music/saveme.mp3',
            image: './assets/img/saveme.jpg'
        },
        {
            name: 'Faded',
            singer: 'Alan Walker',
            path: './assets/music/faded.mp3',
            image: './assets/img/faded.jpg'
        },
        {
            name: 'Faded',
            singer: 'Alan Walker',
            path: './assets/music/faded.mp3',
            image: './assets/img/faded.jpg'
        },
        {
            name: 'Save Me',
            singer: 'DEAMN',
            path: './assets/music/saveme.mp3',
            image: './assets/img/saveme.jpg'
        }
    ],
    setConfig: function(key, value){
        this.config[key]=value
        localStorage.setItem((PLAYER_STORAGE_KEY),JSON.stringify(this.config) )
    }
    ,
    render: function(){
       const htmls= this.songs.map((song,index)=>{
        return ` 
        <div class="song ${index === this.currentIndex ? 'active':''}" data-index="${index}">
            <div class="thumb" style="background-image: url(${song.image})">
            </div>
            <div class="body">
                <h3 class="title">${song.name}</h3>
                <p class="author">${song.singer}</p>
            </div>
            <div class="option">
                <i class="fas fa-ellipsis-h"></i>
            </div>
            </div>`
       })
       playlist.innerHTML = htmls.join('')
    },
    defineProperties: function () {
        Object.defineProperty(this,'currentSong',{
            get: function(){
                return this.songs[this.currentIndex]
            }
        })
    }
    ,
    handleEvents: function(){
        const _this = this
        const cdWidth = cd.offsetWidth
        
        //Xu ly Cd quay
        const cdThumbAnimate= cbThumb.animate([
            {transform : 'rotate(360deg)'}
        ],{
            duration : 10000,
            iterations : Infinity
        })
        cdThumbAnimate.pause()
        // Xử lý phong to thu nhỏ CD
        document.onscroll = function(){
            const scrollTop= window.scrollY
            const newCdWidth = cdWidth -scrollTop
            cd.style.width = newCdWidth > 0 ?  newCdWidth+ 'px': 0
            cd.style.opacity = newCdWidth /  cdWidth
        }

        // xử lí click play/pause
        const player = $('.player')
        playBtn.onclick = function(){
            if( _this.isPlaying){
                audio.pause()
            }
            else{
                audio.play()  
            }

        }
        audio.onplay = function(){
            cdThumbAnimate.play()
            _this.isPlaying = true
               player.classList.add('playing')
        }

        audio.onpause = function(){
            cdThumbAnimate.pause()
            _this.isPlaying = false
               player.classList.remove('playing')

        }
        // Khi tiến độ bài hát thay đổi
        audio.ontimeupdate = function(){
            if( audio.duration){
                const progressPercent =Math.floor(audio.currentTime/ audio.duration * 100)
                progress.value = progressPercent
            }
        }

        // Tua bai hat
        progress.onchange =function(e ){
            const seekTime= e.target.value* audio.duration/100
            audio.currentTime= seekTime

        }
        nextBtn.onclick = function(){
            
            if(_this.isRandom)
               _this.playRandomSong()
            else
               _this.nextSong()

            audio.play()
            _this.render()
            _this.scrollToActiveSong()
        }

        prevBtn.onclick = function(){
            if(_this.isRandom)
               _this.playRandomSong()
            else
              _this.prevSong()

            audio.play()
            _this.render()
            _this.scrollToActiveSong()
            


        }

        randomBtn.onclick = function(){
            _this.isRandom = ! _this.isRandom 
            _this.setConfig('isRandom', _this.isRandom)
            randomBtn.classList.toggle('active',_this.isRandom);
        }

        // xU LY LAP BAI HAT
        repeatBtn.onclick = function(){
            _this.isRepeat = !_this.isRepeat
            _this.setConfig('isRepeat', _this.isRepeat)

            repeatBtn.classList.toggle('active',_this.isRepeat)
        }

        // khi keets thuc bai hat
        audio.onended = function(){
            if(_this.isRepeat){
                audio.play();
            }
            else{
                nextBtn.click();
            }
        }
        // Langw nghe su kien click playlist
        playlist.onclick = function(e){
            const songNode= e.target.closest('.song:not(.active)')
            if(songNode || e.target.closest('.option')){
               // Xu ly click vao song
                if(songNode){
                    _this.currentIndex= Number(songNode.dataset.index)
                    _this.loadCurrentSong()
                    _this.render()
                    audio.play()
               }
                
            }

        }

    },
    scrollToActiveSong: function(){
        setTimeout (()=>{
           $('.song.active').scrollIntoView({
            behavior: 'smooth',
            block: 'nearest'
           })
        },100)
    }
    
    ,
    loadConfig: function(){
        this.isRandom = this.config.isRandom
        this.isRepeat = this.config.isRepeat

    }
    ,

    loadCurrentSong: function(){
        
        heading.textContent = this.currentSong.name
        cbThumb.style.backgroundImage = `url('${this.currentSong.image}')`
        audio.src= this.currentSong.path
    },
    nextSong: function(){
        this.currentIndex++;
        if(this.currentIndex >= this.songs.length ){
            this.currentIndex = 0
        }
        this.loadCurrentSong()
    },
    prevSong: function(){
        this.currentIndex--;
        if(this.currentIndex < 0){
            this.currentIndex = this.songs.length-1
        }
        this.loadCurrentSong()
    },
    playRandomSong: function(){
        let newIndex
        do{
            newIndex = Math.floor(Math.random() * this.songs.length)
        }while(this.currentIndex === newIndex)
        
        this.currentIndex = newIndex
        this.loadCurrentSong()
    }
    ,
    start: function(){
        this.loadConfig()
    
        this.defineProperties()

        this.handleEvents()
        
        this.loadCurrentSong()
        this.render()

        repeatBtn.classList.toggle('active',this.isRepeat)
        randomBtn.classList.toggle('active',this.isRandom);

    }
}
app.start()
