  /* ---- Android app: give the web code the browser speech APIs it expects ----
     The Android WebView has no speech recognition or speech synthesis, so in the app they come from
     the @capacitor-community/speech-recognition and text-to-speech plugins. This file runs before KDN AI. */
  (function(){
    var P = NATIVE && window.Capacitor && window.Capacitor.Plugins; if(!P) return;
    var SRP = P.SpeechRecognition;
    if(SRP && !window.SpeechRecognition && !window.webkitSpeechRecognition){
      window.SpeechRecognition = function(){ this.lang = 'en-IN'; this.interimResults = false; this.continuous = false; this.maxAlternatives = 1; };
      window.SpeechRecognition.prototype.start = function(){
        var me = this, done = false;
        function end(){ if(done) return; done = true; if(me.onend) me.onend(); }
        SRP.requestPermissions().then(function(p){
          if(p && p.speechRecognition && p.speechRecognition!=='granted'){ if(me.onerror) me.onerror({error:'not-allowed'}); end(); return; }
          if(me.onstart) me.onstart();
          return SRP.start({language:me.lang,maxResults:1,prompt:/^hi/.test(me.lang)?'बोलिए…':'Speak now',popup:true,partialResults:false}).then(function(r){
            var t = r && r.matches && r.matches[0];
            if(t){ if(me.onresult) me.onresult({results:[[{transcript:t}]]}); }
            else if(me.onerror) me.onerror({error:'no-speech'});
            end();
          });
        }).catch(function(e){ if(me.onerror) me.onerror({error:/permission|denied/i.test(String(e&&e.message))?'not-allowed':'no-speech'}); end(); });
      };
      window.SpeechRecognition.prototype.stop = function(){ try{ SRP.stop(); }catch(e){} };
      window.SpeechRecognition.prototype.abort = window.SpeechRecognition.prototype.stop;
    }
  })();
  /* speak with the phone's voice in the app; returns true when it handled it */
  function kTTS(text,lang){
    var T = NATIVE && window.Capacitor && window.Capacitor.Plugins && window.Capacitor.Plugins.TextToSpeech;
    if(!T) return false;
    try{ T.stop().catch(function(){}).then(function(){ return T.speak({text:text,lang:lang,rate:1.0,pitch:1.0,volume:1.0,category:'ambient'}); }).catch(function(){}); }catch(e){ return false; }
    return true;
  }
  function kTTSStop(){ var T = NATIVE && window.Capacitor && window.Capacitor.Plugins && window.Capacitor.Plugins.TextToSpeech; if(T) try{ T.stop(); }catch(e){} }
