# design-archive

Superseded designs, parked whole so a rollback is a copy rather than an
archaeology dig. Files here carry a `.txt` extension so nothing in the
build, the type checker or the linter picks them up.

## NavDock-liquid-glass-bar.tsx.txt

The floating liquid-glass nav: a 64px bar 1200px wide at 1920, centred
under a 16-20px top gap, 5px rounded, filled #E5EEE4 at 70% over a
blur, with a white Sign up box. Replaced by the full-bleed Mews-anatomy
bar flush at top 0.

To roll back:

```sh
cp design-archive/NavDock-liquid-glass-bar.tsx.txt src/components/NavDock.tsx
```

then delete the four-line archive header at the top of the file. The
page heroes were tuned for that bar's 80-84px of occupied height and
were left untouched, so nothing else needs reverting.
