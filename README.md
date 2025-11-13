# typings-io

typings-io is a refreshed fork of <a href="https://typings.gg" target="_blank">typings.gg</a> that layers in account support, synced game history, and an analytics dashboard—while keeping the original minimalist typing experience and theme system intact.

![typings.gg](img/typings-screen-shot.png)

## Authentication & game history

1. Copy `config.example.js` to `config.js`.
2. Replace the placeholder value with your Clerk publishable key (`pk_test_...` or `pk_live_...`).
3. Open the typing test, sign in with Clerk, and play normally. Each completed run is saved to your Clerk public metadata (up to the most recent 100 games).

Results are stored client-side through Clerk; no additional backend is required.

## History dashboard

- Visit `history.html` (or use the `history` link in the header) to review charts and a detailed table of your runs.
- The chart visualises WPM and accuracy over time; the table lists language, punctuation, and duration for each saved session.
- When no history is available you’ll see guidance on how to start collecting data.

## theme

type the theme code for example `dracula` in the text box then hit [ windows: <kbd>alt</kbd> + <kbd>t</kbd> ], [ mac: <kbd>cmd</kbd> + <kbd>ctrl</kbd> + <kbd>t</kbd> ], [ linux: <kbd>super</kbd> + <kbd>ctrl</kbd> + <kbd>t</kbd> or <kbd>alt</kbd> + <kbd>t</kbd> ]

available themes:

- `aurora`
- `dark`
- `light`

- `8008` inspired by GMK 8008 by Dixie Mech
- `9009` inspired by GMK 9009 by Dixie Mech
- `burgundy` inspired by GMK Burgundy by cocobrais
- `carbon` inspired by SA Carbon by T0mb3ry
- `denim` inspired by GMK Denim by T0mb3ry
- `dots` inspired by GMK Dots by biip
- `dracula` inspired by GMK Dracula by u/pikku-allu
- `eclipse` inspired by GMK Eclipse by T0mb3ry
- `gruvbox` adapted from [Gruvbox](https://github.com/morhetz/gruvbox)
- `handarbeit` inspired by [Cherry Handarbeit](https://pinchocodia.tistory.com/17)
- `hyperfuse` inspired by GMK HyperFuse origins by BunnyLake
- `mizu` inspired by GMK Mizu by u/Rensuya
- `moderndolch` inspired by GMK Modern Dolch by [Janglad](https://clavier.xyz
- `monokai` inspired by Monokai for TextMate by Wimer Hazenberg
- `mrsleeves` inspired by GMK Mr. Sleeves by [Taeha Types](https://www.taehatypes.com/)
- `nord` inspired by [Nord Theme](https://nordtheme.com)
- `nautilus` inspired by GMK Nautilus by [Zambumon](https://zambumon.com)
- `oblivion` inspired by SA Oblivion by u/Oblotzky
- `olivia` inspired by GMK Olivia by [Olivia](https://github.com/olivia)
- `phantom` inspired by GMK Phantom by u/briano1905
- `rama` inspired by [Rama Works](https://rama.works)
- `sakura` inspired by Varmilo Sakura by [fr3fou](https://github.com/fr3fou)
- `serika` inspired by GMK Serika by [Zambumon](https://zambumon.com)
- `solarizeddark` [bonus: `solarizedlight`] inspired by GMK Solarized Dark by u/thesiscamper
- `vilebloom` inspired by SA Vilebloom by u/UKKeycaps
- `yuri` inspired by GMK Yuri by T0mb3ry
- `honeywell` inspired by GMK Honeywell by Living Speedbump
- `spacecadet` inspired by SA Space Cadet by 7bit
- `1976` inspired by SA 1976 by Engicoder
- `godspeed` inspired by SA Godspeed by Mito
- `leviathan` inspired by SA Leviathan by OneCreativeMind
- `kobayashi` inspired by SA Kobayashi by Madēo

## Redo

- Hold `shift` while pressing Redo to Restart the typing test using the same word list.

## Redo

 - Press `esc` to restart a typing test

## language

type the language code for example `german` in the text box then hit [ windows: <kbd>alt</kbd> + <kbd>l</kbd> ], [ mac: <kbd>cmd</kbd> + <kbd>ctrl</kbd> + <kbd>l</kbd> ], [ linux: <kbd>super</kbd> + <kbd>ctrl</kbd> + <kbd>l</kbd> or <kbd>alt</kbd> + <kbd>l</kbd> ]

available languages:

- `english`
- `english1000`
- `italian`
- `german`
- `spanish`
- `chinese`
- `korean`
- `polish`
- `swedish`
- `dots`
- `punjabi`
- `french`
- `portuguese`

## typing mode

type the mode code for example `time` in the text box then hit [ windows: <kbd>alt</kbd> + <kbd>m</kbd> ], [ mac: <kbd>cmd</kbd> + <kbd>ctrl</kbd> + <kbd>m</kbd> ], [ linux: <kbd>super</kbd> + <kbd>ctrl</kbd> + <kbd>m</kbd> or <kbd>alt</kbd> + <kbd>m</kbd> ]

available modes:

- `wordcount`
- `time`

## punctuation

type `true` or `false` then hit [ windows: <kbd>alt</kbd> + <kbd>p</kbd> ], [ mac: <kbd>cmd</kbd> + <kbd>ctrl</kbd> + <kbd>p</kbd>], [ linux: <kbd>super</kbd> + <kbd>ctrl</kbd> + <kbd>p</kbd> or <kbd>alt</kbd> + <kbd>p</kbd> ] to activate/deactivate punctuations

## theme menu

in this menu you can see all the available themes to choose from, along with a small preview. hit <kbd>escape</kbd> or click 'back' to exit

## calculations

wpm: total number of characters (including spaces) of words you got right divided by five then divided by the time starting from first character typed

acc: total number of characters (including spaces) of words you got right divided by all character in the list of words

## support

- <a href="https://www.paypal.me/briano1905" target="_blank">PayPal</a>