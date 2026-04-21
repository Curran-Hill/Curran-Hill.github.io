---
layout: post
title: Peel Carefully
date: 2026-04-21
categories: ctf
event: CTF@CIT 2026
ctf_category: Misc
tags:
  - Cryptography
  - Decoding
---
![Challenge Card](/assets/images/ctf_cit_2026/peel_carefully/challenge.png)

# **Description**
Peel Carefully is a misc. problem from CTF@CIT 2026. Overall, it is a series of different encodings that you must systematically crack using different online tools. 

# **Walk Through**
 After downloading the challenge.txt file and reading it, we can see that the file is full of dots and dashes.
![Challenge File Morse Code](/assets/images/ctf_cit_2026/peel_carefully/morse_code.png)

This looks exactly like Morse Code, so we need to find a tool to decode it.

The online tool <a href="https://morsecode.world/international/translator.html">Morse Code Translator</a> works perfectly and outputs a series of letters. Specifically the letters A, C, G, and T.
![Morse Code -> DNA](/assets/images/ctf_cit_2026/peel_carefully/morse_to_dna.png)

These letters represent a DNA sequence. The full sequence is shown below.
![Full DNA Sequence](/assets/images/ctf_cit_2026/peel_carefully/dna.png)

So what do we do with the DNA? My team and I explored a few different routes. 

The first thing we tried was putting the sequence into the online tool <a href="web.expasy.org/translate/">Expasy</a> to see if an amino acid sequence may have spit out a message. This got us nowhere.

Next, after a bit of research, we found DNA -> English and DNA -> Binary translation tables on <a href="https://github.com/JohnHammond/ctf-katana">John Hammond's ctf katana GitHub repository</a>. Both of these tables also lead nowhere.

Finally, we found an online tool, <a href="https://www.cachesleuth.com/dnacode.html">Cache Sleuth</a>,1 that decodes DNA sequences into a-z, A-Z, and 0-9. Actually decoding the DNA using this tool gives us a hex byte looking sequence. These are not really hex bytes, but they are very close.
![Cache Sleuth Tool](/assets/images/ctf_cit_2026/peel_carefully/dna_to_almostbytes.png)

The full output of the almost hex bytes is shown below.
![Almost Bytes](/assets/images/ctf_cit_2026/peel_carefully/almost_bytes.png)

So, we need to make these almost bytes into actual bytes. Sounds like a job for everyone's favorite cipher swiss army knife, <a href="https://gchq.github.io/CyberChef/">CyberChef</a>. After putting the almost bytes into CyberChef and preforming a rot13, we have actual hex bytes.
![Real Hex Bytes](/assets/images/ctf_cit_2026/peel_carefully/hex_bytes.png)

Furthermore, after preforming the From Hex operation, we get a Base64 string.
![From Hex Opperation](/assets/images/ctf_cit_2026/peel_carefully/from_hex.png)

Using the From Base64 operation gives us some very interesting characters.
![From Base64](/assets/images/ctf_cit_2026/peel_carefully/from_base64.png)

To figure out what to do next, we used the cipher identifier on <a href="https://www.dcode.fr/cipher-identifier">dcode</a>. This told us that we were likely working with a Base65536 encoding.
![Cipher Identifier](/assets/images/ctf_cit_2026/peel_carefully/cipher_id.png)

We can use dcode again to actually decode the Base65536 string and get the flag.
![Base65536 Decoding](/assets/images/ctf_cit_2026/peel_carefully/base65536_decode.png)

# **Reflection**
This was a very interesting challenge, and as the name and challenge description suggested there were many layers to peel back. I have never seen DNA used for encoding purposes before, so having to explore different avenues to find the correct path forward was a bit of a challenge. This was also my first time using the cipher identifier tool in dcode, and I will definitely continue to use it in the future.