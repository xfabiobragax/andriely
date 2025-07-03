from flask import Blueprint, request, jsonify
from flask_cors import cross_origin
import csv
import os
from datetime import datetime

rsvp_bp = Blueprint('rsvp', __name__)

# Caminho para o arquivo CSV
CSV_FILE = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'database', 'confirmacoes.csv')

def init_csv():
    """Inicializa o arquivo CSV com cabeçalhos se não existir"""
    if not os.path.exists(CSV_FILE):
        os.makedirs(os.path.dirname(CSV_FILE), exist_ok=True)
        with open(CSV_FILE, 'w', newline='', encoding='utf-8') as file:
            writer = csv.writer(file)
            writer.writerow(['Data/Hora', 'Nome Completo', 'Presença', 'Observações', 'IP'])

@rsvp_bp.route('/confirmar', methods=['POST'])
@cross_origin()
def confirmar_presenca():
    """Endpoint para receber confirmações de presença"""
    try:
        # Inicializa o CSV se necessário
        init_csv()
        
        # Obtém os dados do formulário
        data = request.get_json()
        
        if not data:
            return jsonify({'error': 'Dados não fornecidos'}), 400
        
        nome = data.get('nomeCompleto', '').strip()
        presenca = data.get('presenca', '').strip()
        observacoes = data.get('observacoes', '').strip()
        
        # Validações básicas
        if not nome:
            return jsonify({'error': 'Nome completo é obrigatório'}), 400
        
        if presenca not in ['sim', 'nao']:
            return jsonify({'error': 'Confirmação de presença inválida'}), 400
        
        # Obtém o IP do cliente
        client_ip = request.environ.get('HTTP_X_FORWARDED_FOR', request.environ.get('REMOTE_ADDR', 'N/A'))
        
        # Salva no CSV
        with open(CSV_FILE, 'a', newline='', encoding='utf-8') as file:
            writer = csv.writer(file)
            writer.writerow([
                datetime.now().strftime('%d/%m/%Y %H:%M:%S'),
                nome,
                'Sim' if presenca == 'sim' else 'Não',
                observacoes,
                client_ip
            ])
        
        return jsonify({
            'success': True,
            'message': 'Confirmação registrada com sucesso!',
            'data': {
                'nome': nome,
                'presenca': presenca,
                'observacoes': observacoes
            }
        }), 200
        
    except Exception as e:
        return jsonify({'error': f'Erro interno do servidor: {str(e)}'}), 500

@rsvp_bp.route('/status', methods=['GET'])
@cross_origin()
def status():
    """Endpoint para verificar status do sistema"""
    try:
        # Conta quantas confirmações temos
        confirmacoes_count = 0
        confirmacoes_sim = 0
        confirmacoes_nao = 0
        
        if os.path.exists(CSV_FILE):
            with open(CSV_FILE, 'r', encoding='utf-8') as file:
                reader = csv.reader(file)
                next(reader)  # Pula o cabeçalho
                for row in reader:
                    if len(row) >= 3:
                        confirmacoes_count += 1
                        if row[2] == 'Sim':
                            confirmacoes_sim += 1
                        else:
                            confirmacoes_nao += 1
        
        return jsonify({
            'status': 'online',
            'total_confirmacoes': confirmacoes_count,
            'confirmacoes_sim': confirmacoes_sim,
            'confirmacoes_nao': confirmacoes_nao,
            'csv_file': CSV_FILE
        }), 200
        
    except Exception as e:
        return jsonify({'error': f'Erro ao verificar status: {str(e)}'}), 500

@rsvp_bp.route('/download', methods=['GET'])
@cross_origin()
def download_csv():
    """Endpoint para download do arquivo CSV (opcional - para administração)"""
    try:
        if not os.path.exists(CSV_FILE):
            return jsonify({'error': 'Arquivo de confirmações não encontrado'}), 404
        
        from flask import send_file
        return send_file(CSV_FILE, as_attachment=True, download_name='confirmacoes_festa_benjamin.csv')
        
    except Exception as e:
        return jsonify({'error': f'Erro ao fazer download: {str(e)}'}), 500

