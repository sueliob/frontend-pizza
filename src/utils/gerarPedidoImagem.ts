import html2canvas from "html2canvas";

/**
 * Captura um elemento e retorna dataURL JPEG.
 * @param idElemento ex.: "pedido"
 * @param qualidade 0..1 (default: 0.95)
 * @param escala ex.: 2 (nitidez)
 */
export async function gerarPedidoImagem(
  idElemento = "pedido",
  qualidade = 0.95,
  escala = 2
): Promise<string> {
  const el = document.getElementById(idElemento);
  if (!el) throw new Error(`Elemento #${idElemento} não encontrado`);

  const canvas = await html2canvas(el, {
    backgroundColor: "#ffffff",
    scale: escala,
    useCORS: true,
  });

  return canvas.toDataURL("image/jpeg", qualidade);
}