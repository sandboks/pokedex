# TypeScript Pokédex Project

## Overview
A Command Line Interface that uses PokeAPI (https://pokeapi.co/) to fetch and display various bits of Pokemon data. Written in TypeScript.

## Features
- An interactive CLI using a REPL (Read-Eval-Print Loop) environment
- Various command line arguments

## Requirements
- Node.js 
- npm 

## Setup
1. Clone the repository:
   ```bash
   git clone git@github.com:sandboks/pokedex.git
   cd pokedex
   ```
2. Install dependencies:
   ```bash
   npm install
   ```

3. Run the program!
    ```bash
    npm run dev
    ```

## Example usage:
   ```bash
    Welcome to the Pokedex! Enter a command
    Pokedex> catch pikachu
    Throwing ball at pikachu...
    Catch rate: 190 | You rolled: 191
    pikachu got away...
    Pokedex> catch pikachu
    Throwing ball at pikachu...
    Catch rate: 190 | You rolled:  31
    Successfully captured pikachu!
    Pokedex> inspect pikachu
    Name: pikachu
    Type: [electric] 
    Height: 0.4m
    Weight: 6.0kg
    BST:
    -- hp: 35
    -- attack: 55
    -- defense: 40
    -- special-attack: 50
    -- special-defense: 50
    -- speed: 90
    Pokedex> catch pidgey
    Throwing ball at pidgey...
    Catch rate: 255 | You rolled: 165
    Successfully captured pidgey!
    Pokedex> pokedex
    === POKEDEX ENTRIES: [002] ===
    - pikachu
    - pidgey
    ==============================
    Pokedex> exit
    Closing the Pokedex... Goodbye!
    ```