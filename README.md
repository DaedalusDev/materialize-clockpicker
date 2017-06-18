# Description:
This is a materialize clockpicker designed as an addition to http://materializecss.com/

Original source codes are taken from https://github.com/chingyawhao/materialize-clockpicker

Most source codes are taken from https://github.com/weareoutman/clockpicker

##Install:
### git
`git clone https://github.com/DaedalusDev/materialize-clockpicker.git`
# Api Doc
## Options:
### Full Default configuration
Here are some options and their defaults:
``` javascript
default: '',            // default time, 'now' or '13:14' e.g.
fromnow: 0,             // set default time to * milliseconds from now
donetext: 'Done',       // done button text
autoclose: false,       // auto close when minute is selected
ampmclickable: false,   // set am/pm button on itself
darktheme: false,       // set to dark theme
twelvehour: true,       // change to 12 hour AM/PM clock from 24 hour
vibrate: true,          // vibrate the device when dragging clock hand
container: '',          // default will append clock next to input
dismissible: true,      // dismissable
 
// Time restrictions
interval: false,        // set a time interval in minute / if 60, skip minute picker
min: false,             // set the min time. ex: [13, 30] for 13:30
max: false,             // set the max time. ex: [18, 30] for 18:30
disable: false          // disable time value. ex: [[8,30],[12],[14,0],[null,15]] for 8:30, 12:**, 14:30 and **:15
 
// Events:
init                    // After plugin init
beforeShow              // Before Show picker
afterShow               // After show picker
beforeHourSelect        // Before hour select
afterHourSelect         // After hour select
beforeDone              // Before Done
afterDone               // After done
invalidHour             // on invalid hour picking
invalidMinute           // on invalid minute picking
invalidTime             // on invalid done
```
### Setting defaults
If you want to change the global default fonctionnality from this plugin, you can access default settings using $.fn.pickatime.defaults. 
Example:
``` javascript
$.fn.pickatime.defaults.interval = 15;      // single change
$.extend( true, $.fn.pickatime.defaults, {  // Multiple change
    "donetext": 'Ok',
    "min": 'now'
});
```
## Usage
### At plugin init
``` javascript
$('#myInput').pickatime({
    donetext: 'Banzaï',
    darktheme: true,
    beforeShow: function(e, clockPicker) {
        // do someting
    }
});
```
### After plugin init
You can get the clockpicker instance :
``` javascript
$('#myInput').pickatime();          // Method 1
$('#myInput').data('clockpicker');  // Method 2
```
#### Events
Note : All event use namespace "clockpicker"
``` javascript
$('#myInput')
    .on('beforeShow.invalidHour', function(e, clockPicker) {
        // do someting
        // You can get current error with clockPicker.error
    });
```
#### Change some options
``` javascript
// Simply recall apply new options on isntance
$('#myInput')
    .pickatime({
        darktheme: false,
        donetext: 'Oki doki',
    });
    
// With set method
// Method 1 :
$('#myInput')
    .pickatime('set','darktheme', true) // set individual change
    .pickatime('set', {                 // multiple changes
        donetext: 'Ok',
        min: [8, 30]
    });
 
// Method 2 :
$('#myInput')
    .pickatime()
        .set('darktheme',true)  // set individual change
        .set({                  // multiple changes
            donetext: 'Ok',
            min: [8, 30]
        });
```

### Time format handler
The plugin can handle various time format :
``` javascript
// Arrays formatted as [h,m].
clockpicker.set('min', [5,30]); // for 05:30
 
// Date objects.
clockpicker.set('max', new Date(2017,6,18,5,30)); // for 05:30
 
// Using formatted strings.
clockpicker.set('min', '05:30')); // for 05:30
clockpicker.set('min', '05:30PM')); // for 17:30
 
// Using integers as time relative to now.
clockpicker.set('max', -4) // now -4 hours
 
// Using `now` for “now”.
clockpicker.set('min', 'now') //
 
// Using `false` to remove.
clockpicker.set('max', false)
```
## Screenshots:
![Image of Materialize Clock Light](https://github.com/DaedalusDev/materialize-clockpicker/blob/master/images/material-clock-light.PNG)
![Image of Materialize Clock Dark](https://github.com/DaedalusDev/materialize-clockpicker/blob/master/images/material-clock-dark.PNG)

## Developing:
```
npm install
grunt monitor
```

## Getting started

### Basic setup

1. Make sure you have materialize css (including their JavaScript files): http://materializecss.com/

2. Install this package via git.

3. Create an input field in your html code like the following:

  ```
  <div class="input-field col s12">
      <label for="timepicker">Time</label>
      <input id="timepicker" class="timepicker" type="time">
  </div>
  ```

3. Your can use html data attr to change some options

  ```
  <div class="input-field col s12">
      <label for="timepicker">Time</label>
      <input id="timepicker" data-default="14:20:00" class="timepicker" type="time">
  </div>
  ```

4. Add the Javascript trigger with the corresponding [options](https://github.com/DaedalusDev/materialize-clockpicker#options)

  ```
  <script>
    $('#timepicker').pickatime({
      autoclose: false,
      twelvehour: false,
      default: '14:20:00'
    });
  </script>
  ```

You can trigger the clock either by ID's or classes (useful if you have several clocks on one page).
