"""Situação cadastral temporária no upload (não altera mescla canônica)."""

from pathlib import Path

import polars as pl

from app.situacao_sacados import situacao_para_validacao


def test_situacao_para_validacao_nao_altera_base(tmp_path: Path) -> None:
    base = tmp_path / "situacao_base.csv"
    base.write_text("DOC_SACADO;SITUACAO\n11.111.111/0001-11;INAPTA\n", encoding="utf-8")
    notas = tmp_path / "notas.csv"
    notas.write_text(
        "NOME_FUNDO;DOC_FUNDO;NOME_CEDENTE;DOC_CEDENTE;NOME_SACADO;DOC_SACADO;"
        "NU_DOCUMENTO;TIPO_RECEBIVEL;VALOR_NOMINAL;DATA_VENCIMENTO_ORIGINAL;DATA_AQUISICAO\n"
        "F;1;C;2;S;22.222.222/0001-22;1;Duplicata;100,00;01/01/2027;01/01/2026\n",
        encoding="utf-8",
    )
    temp = tmp_path / "situacao_temp.csv"
    situacao_para_validacao(notas, base=base, saida_temporaria=temp)

    assert base.read_text(encoding="utf-8").strip().endswith("INAPTA")
    df = pl.read_csv(temp, separator=";")
    assert df.height == 2
    inapta = df.filter(pl.col("DOC_SACADO") == "11.111.111/0001-11")
    assert inapta["SITUACAO"][0] == "INAPTA"
    nova = df.filter(pl.col("DOC_SACADO") == "22.222.222/0001-22")
    assert nova["SITUACAO"][0] == "ATIVA"
