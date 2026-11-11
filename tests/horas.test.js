import { describe,expect,it } from 'vitest';import { angulosParaHora,formatarHorario,gerarDistratores,gerarHorario,horaParaAngulos,mesmoMostrador,niveis,noMostrador,normalizarHorario } from '../Games/horas/jogo.js';
describe('Que Horas São?',()=>{it('converte hora em ângulos e volta para todas as horas e minutos',()=>{for(let hora=0;hora<24;hora++)for(let minuto=0;minuto<60;minuto++){const a=horaParaAngulos(hora,minuto);expect(a.minutos).toBe(minuto*6);expect(a.horas).toBe((hora%12)*30+minuto*.5);expect(angulosParaHora(a.horas,a.minutos,hora)).toEqual({hora,minuto})}});it('gera horários compatíveis com cada nível',()=>{for(const [id,nivel] of Object.entries(niveis))for(let i=0;i<1000;i++){const h=gerarHorario(id);expect(nivel.minutos).toContain(h.minuto);expect(h.hora).toBeGreaterThanOrEqual(0);expect(h.hora).toBeLessThan(24)}});it('gera quatro opções únicas, incluindo a correta e distratores plausíveis',()=>{for(let hora=0;hora<24;hora++)for(const minuto of [0,5,15,30,45,59]){const alvo={hora,minuto},opcoes=gerarDistratores(alvo);expect(opcoes).toHaveLength(4);expect(new Set(opcoes.map(formatarHorario)).size).toBe(4);expect(opcoes.map(formatarHorario)).toContain(formatarHorario(noMostrador(hora,minuto)))
for(const opcao of opcoes){expect(opcao.hora).toBeGreaterThanOrEqual(1)
expect(opcao.hora).toBeLessThanOrEqual(12)}}});

  // No modo Ajuste os ponteiros partem de 12:00: avançar até 03:00 passa por 15:00,
  // que no mostrador é o mesmo horário e precisa valer como acerto.
  it('aceita o ajuste que mostra o horário pedido, antes ou depois do meio-dia',()=>{
    const avancar=(horario,minutos)=>normalizarHorario(0,horario.hora*60+horario.minuto+minutos);
    const inicio={hora:12,minuto:0};
    expect(mesmoMostrador(avancar(inicio,180),{hora:3,minuto:0})).toBe(true);
    expect(mesmoMostrador(avancar(inicio,-540),{hora:3,minuto:0})).toBe(true);
    expect(mesmoMostrador(avancar(inicio,90),{hora:1,minuto:30})).toBe(true);
    expect(mesmoMostrador({hora:0,minuto:15},{hora:12,minuto:15})).toBe(true);
    expect(mesmoMostrador(avancar(inicio,175),{hora:3,minuto:0})).toBe(false);
    expect(mesmoMostrador({hora:4,minuto:0},{hora:3,minuto:0})).toBe(false);
  });
});
